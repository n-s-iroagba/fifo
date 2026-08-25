import { Router } from 'express';
import { authController } from '../controllers/AuthController';
import { jobController } from '../controllers/JobController';
import { applicationController } from '../controllers/ApplicationController';

import { adminController } from '../controllers/AdminController';
import { notificationController } from '../controllers/NotificationController';
import { cvController } from '../controllers/CvController';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { apiLimiter, authLimiter } from '../utils/rateLimiter';
import { CONSTANTS } from '../constants';
import multer from 'multer';
import { applicantAuditMiddleware } from '../middleware/auditMiddleware';
import { lmsAuthController } from '../controllers/LmsAuthController';
import { courseController } from '../controllers/CourseController';
import { examController } from '../controllers/ExamController';
import { examAttemptController } from '../controllers/ExamAttemptController';
import { certificateController } from '../controllers/CertificateController';
import { ticketController } from '../controllers/TicketController';
// Removed requirePsychometricClear import
import { psychometricController } from '../controllers/PsychometricController';


const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per file
});

const router = Router();

// Apply Audit Alert to all routes
router.use(applicantAuditMiddleware);

// =======================
// Public Routes
// =======================
// STK-APP-AUTH-004: email/password registration and login (NFR-SEC-008: rate limited)
router.use('/auth', authLimiter);
router.post('/auth/register', authController.register.bind(authController));
router.post('/auth/register-admin', authController.registerAdmin.bind(authController));
router.post('/auth/login', authController.login.bind(authController));
router.post('/auth/refresh', authController.refresh.bind(authController));
router.post('/auth/logout', authController.logout.bind(authController));
router.get('/auth/me', requireAuth, authController.getMe.bind(authController));
router.put('/auth/profile', requireAuth, authController.updateProfile.bind(authController));
router.get('/auth/verify-email', authController.verifyEmail.bind(authController));
router.post('/auth/forgot-password', authController.forgotPassword.bind(authController));
router.post('/auth/reset-password', authController.resetPassword.bind(authController));
router.post('/auth/resend-verification', authController.resendVerification.bind(authController));
router.put('/auth/change-password', requireAuth, authController.changePassword.bind(authController));

// STK-APP-AUTH-001, STK-ADM-JOB-004: public job listings
router.use('/jobs', apiLimiter);
router.get('/jobs', jobController.getActiveJobs.bind(jobController));
router.get('/jobs/:id', jobController.getJobDetails.bind(jobController));


// =======================
// Applicant Routes (requireAuth + APPLICANT role)
// =======================
const applicantMW = [requireAuth, requireRole([CONSTANTS.ROLES.APPLICANT]), apiLimiter];

// STK-APP-DASH-001..003
router.get('/dashboard', ...applicantMW, applicationController.getDashboardSummary.bind(applicationController));

// STK-APP-APPLY-001..005
router.post('/applications', ...applicantMW, applicationController.startApplication.bind(applicationController));
router.get('/applications', ...applicantMW, applicationController.getUserApplications.bind(applicationController));
router.get('/applications/:id', ...applicantMW, applicationController.getApplicationDetails.bind(applicationController));
router.post('/applications/:id/advance', ...applicantMW, applicationController.advanceApplication.bind(applicationController));
router.post('/applications/:id/visa-sponsorship', ...applicantMW, applicationController.applyVisaSponsorship.bind(applicationController));

// STK-APP-CV-001..004
router.get('/cv', ...applicantMW, cvController.getCv.bind(cvController));
router.post('/cv', ...applicantMW, cvController.uploadCv.bind(cvController));
router.put('/cv', ...applicantMW, cvController.updateCv.bind(cvController));
router.delete('/cv', ...applicantMW, cvController.deleteCv.bind(cvController));

// Psychometric Test Routes
router.get('/psychometric/status', ...applicantMW, psychometricController.getStatus.bind(psychometricController));
router.get('/psychometric/module/:module/questions', ...applicantMW, psychometricController.getQuestions.bind(psychometricController));
router.post('/psychometric/module/:module/submit', ...applicantMW, psychometricController.submitModule.bind(psychometricController));

// Ticket Sponsorship & Management Routes
router.get('/tickets', ...applicantMW, ticketController.getUserTickets.bind(ticketController));
router.get('/tickets/:id', ...applicantMW, ticketController.getTicketById.bind(ticketController));
router.post('/tickets', ...applicantMW, ticketController.createTicket.bind(ticketController));
router.put('/tickets/:id', ...applicantMW, ticketController.updateTicket.bind(ticketController));
router.post('/tickets/:id/apply-sponsorship', ...applicantMW, ticketController.applySponsorship.bind(ticketController));
router.post('/tickets/:id/request-retake', ...applicantMW, ticketController.requestRetake.bind(ticketController));
router.post('/tickets/:id/refund-choice', ...applicantMW, ticketController.processRefundChoice.bind(ticketController));
router.post('/tickets/:id/pay-aveling', ...applicantMW, ticketController.payTicketOnAveling.bind(ticketController));
router.post('/tickets/:id/exam-outcome', ...applicantMW, ticketController.recordExamOutcome.bind(ticketController));
router.post('/tickets/:id/set-review-awaiting', ...applicantMW, ticketController.setExamReviewAwaiting.bind(ticketController));



// STK-APP-NOTIF-001..003, TRUST-008: notifications
router.get('/notifications', ...applicantMW, notificationController.getUserNotifications.bind(notificationController));
router.put('/notifications/mark-all-read', ...applicantMW, notificationController.markAllRead.bind(notificationController));
router.put('/notifications/:id/read', ...applicantMW, notificationController.markAsRead.bind(notificationController));


// =======================
// Admin Routes (requireAuth + ADMIN role) — NFR-SEC-004
// =======================
const adminMW = [requireAuth, requireRole([CONSTANTS.ROLES.ADMIN]), apiLimiter];

// STK-ADM-HEALTH-001..003
router.get('/admin/health', ...adminMW, adminController.getHealth.bind(adminController));

// STK-ADM-APP-001: new/completed applications
router.get('/admin/applications', ...adminMW, applicationController.getAdminApplications.bind(applicationController));
// STK-ADM-APP-002: draft applications
router.get('/admin/applications/drafts', ...adminMW, applicationController.getDraftApplications.bind(applicationController));
// STK-ADM-APP-003, STK-ADM-APP-004: send mail/push to applicant
router.post('/admin/mail', ...adminMW, upload.array('attachments'), adminController.sendMailToApplicant.bind(adminController));

// New: manage ad-hoc stages for specific applications
router.post('/admin/applications/:id/stages', ...adminMW, applicationController.addStage.bind(applicationController));
router.get('/admin/applications/:id/stages/:stageId', ...adminMW, applicationController.getStageDetails.bind(applicationController));
router.put('/admin/applications/:id/stages/:stageId', ...adminMW, applicationController.updateStage.bind(applicationController));
router.delete('/admin/applications/:id/stages/:stageId', ...adminMW, applicationController.deleteStage.bind(applicationController));
router.post('/admin/applications/:id/stages/:stageId/complete', ...adminMW, applicationController.completeApplicationStage.bind(applicationController));
router.post('/admin/applications/:id/complete', ...adminMW, applicationController.completeApplication.bind(applicationController));
router.delete('/admin/applications/:id', ...adminMW, applicationController.deleteApplication.bind(applicationController));
router.get('/admin/applications/:id', ...adminMW, applicationController.getApplicationDetails.bind(applicationController));
router.put('/admin/applications/:id/visa-sponsorship', ...adminMW, applicationController.updateVisaSponsorshipStatus.bind(applicationController));

router.post('/admin/applications/:id/nominations', ...adminMW, applicationController.createNominations.bind(applicationController));
router.get('/admin/applications/:id/nominations', ...adminMW, applicationController.getNominations.bind(applicationController));

// Applicant Nomination Upload
router.post('/applications/documents', ...applicantMW, applicationController.uploadNominationDocument.bind(applicationController));
router.get('/applications/:id/nominations', ...applicantMW, applicationController.getNominations.bind(applicationController));

// Admin Contract endpoints
router.get('/admin/applications/:id/contracts', ...adminMW, applicationController.getContracts.bind(applicationController));
router.post('/admin/applications/:id/contracts', ...adminMW, applicationController.createContract.bind(applicationController));

// Candidate Contract endpoints
router.get('/applications/:id/contracts', ...applicantMW, applicationController.getContracts.bind(applicationController));
router.post('/applications/contracts/documents', ...applicantMW, applicationController.uploadContractDocument.bind(applicationController));
router.put('/applications/:id/contracts/:contractId/accept', ...applicantMW, applicationController.acceptContract.bind(applicationController));
router.put('/applications/:id/contracts/:contractId/reject', ...applicantMW, applicationController.rejectContract.bind(applicationController));

// STK-ADM-JOB-001..005
router.get('/admin/jobs/stats', ...adminMW, jobController.getJobStats.bind(jobController));
router.get('/admin/jobs', ...adminMW, jobController.getAllJobsAdmin.bind(jobController));
router.get('/admin/jobs/:id', ...adminMW, jobController.getJobDetails.bind(jobController));
router.post('/admin/jobs', ...adminMW, jobController.createJob.bind(jobController));
router.put('/admin/jobs/:id', ...adminMW, jobController.updateJob.bind(jobController));
router.delete('/admin/jobs/:id', ...adminMW, jobController.deleteJob.bind(jobController));


// STK-ADM-BANK-001..004
router.get('/admin/finance/configs', ...adminMW, adminController.getFinancialConfigs.bind(adminController));
router.get('/admin/bank-accounts', ...adminMW, adminController.getAllBankAccounts.bind(adminController));
// Public route for candidates to fetch bank details for checkout
router.get('/bank-accounts', adminController.getAllBankAccounts.bind(adminController));
router.get('/admin/bank-accounts/:id', ...adminMW, adminController.getBankAccountById.bind(adminController));

router.get('/admin/finance/bank-accounts/by-amount', ...adminMW, adminController.getBankAccountsForAmount.bind(adminController));
router.post('/admin/bank-accounts', ...adminMW, adminController.createBankAccount.bind(adminController));
router.put('/admin/bank-accounts/:id', ...adminMW, adminController.updateBankAccount.bind(adminController));
router.delete('/admin/bank-accounts/:id', ...adminMW, adminController.deleteBankAccount.bind(adminController));


// STK-ADM-CAT-001..003
router.get('/admin/jobs/metadata', ...adminMW, adminController.getJobConfigs.bind(adminController));
router.get('/admin/categories', ...adminMW, adminController.getAllCategories.bind(adminController));
router.get('/admin/categories/:id', ...adminMW, adminController.getCategoryById.bind(adminController));
router.post('/admin/categories', ...adminMW, adminController.createCategory.bind(adminController));
router.put('/admin/categories/:id', ...adminMW, adminController.updateCategory.bind(adminController));
router.delete('/admin/categories/:id', ...adminMW, adminController.deleteCategory.bind(adminController));

// REG-004: admin user management
router.get('/admin/users/:id', ...adminMW, adminController.getApplicantById.bind(adminController));
router.get('/admin/users', ...adminMW, adminController.getAllApplicants.bind(adminController));
router.delete('/admin/users/:id', ...adminMW, adminController.deleteApplicant.bind(adminController));
router.post('/admin/users/:id/welcome-mail', ...adminMW, adminController.sendWelcomeMail.bind(adminController));
router.post('/admin/users/:id/eoi-mail', ...adminMW, adminController.sendEOIMail.bind(adminController));
router.put('/admin/users/:id/wallet', ...adminMW, adminController.updateApplicantWallet.bind(adminController));
router.put('/admin/users/:id/aveling-credentials', ...adminMW, adminController.updateAvelingCredentials.bind(adminController));

router.put('/admin/users/:id/subsidy-percentage', ...adminMW, adminController.updateApplicantSubsidy.bind(adminController));
router.put('/admin/applicants/:id/aveling-credentials', ...adminMW, adminController.updateAvelingCredentials.bind(adminController));

// Candidate Portal Lookup & Payment Email Routes
router.post('/candidate/lookup', apiLimiter, ticketController.candidateLookup.bind(ticketController));
router.post('/tickets/:id/checkout-email', apiLimiter, ticketController.sendCheckoutPaymentEmail.bind(ticketController));

// Admin Ticket Management Routes
router.get('/admin/tickets', ...adminMW, ticketController.adminGetAllTickets.bind(ticketController));
router.put('/admin/tickets/:id', ...adminMW, ticketController.adminUpdateTicket.bind(ticketController));
router.delete('/admin/tickets/:id', ...adminMW, ticketController.adminDeleteTicket.bind(ticketController));
router.post('/admin/tickets/:id/approve-receipt', ...adminMW, ticketController.adminApproveReceipt.bind(ticketController));
router.post('/admin/applications/:id/tickets', ...adminMW, ticketController.adminAddApplicationTicket.bind(ticketController));
router.post('/admin/applications/:id/tickets/batch', ...adminMW, ticketController.adminBatchAddApplicationTickets.bind(ticketController));
router.post('/admin/tickets/:id/generate-credentials', ...adminMW, ticketController.adminGenerateAvelingCredentials.bind(ticketController));
router.post('/admin/tickets/:id/validate-payment', ...adminMW, ticketController.adminValidatePayment.bind(ticketController));
router.post('/admin/tickets/:id/approve-exam', ...adminMW, ticketController.adminApproveExamResult.bind(ticketController));
router.get('/admin/tickets/:id/exams', ...adminMW, ticketController.getExamAttempts.bind(ticketController));
// Clause 7.4: Wallet statement (admin view) — itemised ledger on demand
router.get('/admin/users/:userId/wallet-statement', ...adminMW, ticketController.getCandidateWalletStatement.bind(ticketController));
// Clause 9.2: Admin remediation options after second_attempt_failed
router.post('/admin/tickets/:id/remediate-second-fail', ...adminMW, ticketController.adminRemediateSecondFail.bind(ticketController));

// Schedule 1 / Clause 5.1: Payment Milestone Gate
// Admin verifies A$500 deposit → unlocks Tickets 1-3
router.post('/admin/users/:userId/verify-deposit', ...adminMW, ticketController.adminVerifyDeposit.bind(ticketController));
// Admin verifies full balance → unlocks all tickets
router.post('/admin/users/:userId/verify-full-balance', ...adminMW, ticketController.adminVerifyFullBalance.bind(ticketController));
// Admin / applicant views milestone status
router.get('/admin/users/:userId/payment-milestone', ...adminMW, ticketController.getPaymentMilestoneStatus.bind(ticketController));
// Applicant self-service: view their own payment milestone status
router.get('/payment-milestone', ...applicantMW, ticketController.getOwnPaymentMilestoneStatus.bind(ticketController));


// Batch Ticket Sponsorship & Invoice Operations
router.post('/admin/users/:userId/assign-all-tickets', ...adminMW, ticketController.assignAllTicketsToUser.bind(ticketController));
router.post('/tickets/apply-batch-sponsorship', ...applicantMW, ticketController.applyBatchPackageSponsorship.bind(ticketController));
router.post('/admin/users/:userId/approve-package-invoice', ...adminMW, ticketController.approvePackageAndSendInvoice.bind(ticketController));

// Payment status milestone (partial / complete) & Custom Invoicing
router.post('/admin/users/:userId/update-payment-status', ...adminMW, ticketController.adminUpdatePaymentStatus.bind(ticketController));
router.post('/admin/invoices/dispatch', upload.any(), ...adminMW, adminController.dispatchInvoiceEmail.bind(adminController));
router.get('/admin/invoices', ...adminMW, adminController.getAllInvoices.bind(adminController));
router.post('/admin/invoices/:id/receipt', ...adminMW, adminController.generateInvoiceReceipt.bind(adminController));


// Prefill Stages removed

// Candidate receipt submission (public or candidate authenticated)
router.post('/tickets/:id/submit-receipt', ticketController.submitReceipt.bind(ticketController));

// Admin Psychometric Test Review
router.get('/admin/psychometric/attempts', ...adminMW, psychometricController.getAdminAttempts.bind(psychometricController));
router.post('/admin/psychometric/attempts/:id/approve', ...adminMW, psychometricController.approveAttempt.bind(psychometricController));
router.post('/admin/psychometric/attempts/:id/reject', ...adminMW, psychometricController.rejectAttempt.bind(psychometricController));


import { interestController } from '../controllers/InterestController';
import { ticketCatalogController } from '../controllers/TicketCatalogController';

// Expression of Interest Routes
router.post('/interests', ...applicantMW, interestController.createInterest.bind(interestController));
router.put('/interests/me', ...applicantMW, interestController.updateInterest.bind(interestController));
router.get('/interests/me', ...applicantMW, interestController.getUserInterest.bind(interestController));
router.get('/admin/interests', ...adminMW, interestController.getAllInterests.bind(interestController));
router.delete('/admin/interests/:id', ...adminMW, interestController.deleteInterest.bind(interestController));
router.post('/admin/interests/:id/approve', ...adminMW, interestController.approveInterest.bind(interestController));

// =======================
// Ticket Catalog Routes
// =======================
router.get('/ticket-catalogs', ticketCatalogController.getAll.bind(ticketCatalogController));
router.post('/admin/ticket-catalogs', ...adminMW, ticketCatalogController.create.bind(ticketCatalogController));
router.put('/admin/ticket-catalogs/:id', ...adminMW, ticketCatalogController.updateTicketCatalog.bind(ticketCatalogController));
router.delete('/admin/ticket-catalogs/:id', ...adminMW, ticketCatalogController.deleteTicketCatalog.bind(ticketCatalogController));
router.post('/admin/seed', ...adminMW, adminController.triggerSeed.bind(adminController));

// =======================
// LMS Routes
// =======================

// Public LMS Auth (STEP-031)
router.use('/lms-auth', apiLimiter);
router.post('/lms-auth/login', lmsAuthController.login.bind(lmsAuthController));

// Admin LMS Credential Management (STEP-030)
router.get('/lms-credentials/applicants/:applicantId', ...adminMW, lmsAuthController.getLmsCredentialsStatus.bind(lmsAuthController));
router.post('/lms-credentials/generate', ...adminMW, lmsAuthController.generateCredentials.bind(lmsAuthController));


// Admin Course Management (STEP-001 - STEP-006)
router.get('/courses', courseController.getPublishedCourses.bind(courseController));
router.get('/courses/:id', courseController.getCourseById.bind(courseController));
router.get('/courses/certifications/lookup', ...adminMW, courseController.getCertificationTypes.bind(courseController));
router.post('/courses', ...adminMW, courseController.createCourse.bind(courseController));
router.get('/courses/admin/all', ...adminMW, courseController.getAllAdminCourses.bind(courseController));
router.patch('/courses/:id/publish', ...adminMW, courseController.togglePublish.bind(courseController));
router.post('/courses/bulk-import', ...adminMW, courseController.bulkImport.bind(courseController));
router.get('/courses/:id/modules', ...adminMW, courseController.getModules.bind(courseController));
router.post('/courses/:id/modules', ...adminMW, courseController.addModule.bind(courseController));
router.put('/courses/:id/modules/:moduleId', ...adminMW, courseController.updateModule.bind(courseController));
router.delete('/courses/:id/modules/:moduleId', ...adminMW, courseController.deleteModule.bind(courseController));

// Admin Exam Management
router.get('/exams/courses/:courseId/question-bank', ...adminMW, examController.getQuestionBank.bind(examController));
router.post('/exams/courses/:courseId/questions', ...adminMW, examController.addQuestion.bind(examController));
router.put('/exams/questions/:questionId', ...adminMW, examController.updateQuestion.bind(examController));
router.put('/exams/courses/:courseId/settings', ...adminMW, examController.updateSettings.bind(examController));
router.delete('/exams/questions/:questionId', ...adminMW, examController.deleteQuestion.bind(examController));



// Learner Exam Attempts
router.get('/exams/attempts/:attemptId', ...applicantMW, examAttemptController.getAttemptDetails.bind(examAttemptController));
router.post('/exams/attempts/start', ...applicantMW, examAttemptController.startAttempt.bind(examAttemptController));
router.post('/exams/attempts/:attemptId/answers', ...applicantMW, examAttemptController.saveAnswers.bind(examAttemptController));
router.post('/exams/attempts/:attemptId/submit', ...applicantMW, examAttemptController.submitAttempt.bind(examAttemptController));
router.get('/exams/attempts/:attemptId/result', ...applicantMW, examAttemptController.getAttemptResult.bind(examAttemptController));



// Certificates
router.get('/certificates/learner/me', ...applicantMW, certificateController.getMyCertificates.bind(certificateController));
router.post('/certificates/issue', ...adminMW, certificateController.issueCertificate.bind(certificateController));

export default router;
