import { Router } from 'express';
import { authController } from '../controllers/AuthController';
import { jobController } from '../controllers/JobController';
import { applicationController } from '../controllers/ApplicationController';
import { paymentController } from '../controllers/PaymentController';
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
import { practicalAssessmentController } from '../controllers/PracticalAssessmentController';
import { examAttemptController } from '../controllers/ExamAttemptController';
import { practicalSessionController } from '../controllers/PracticalSessionController';
import { certificateController } from '../controllers/CertificateController';
import { ticketController } from '../controllers/TicketController';
import { PrefillStageController } from '../controllers/PrefillStageController';

const prefillStageController = new PrefillStageController();


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

// Ticket Sponsorship & Management Routes
router.get('/tickets', ...applicantMW, ticketController.getUserTickets.bind(ticketController));
router.get('/tickets/:id', ...applicantMW, ticketController.getTicketById.bind(ticketController));
router.post('/tickets', ...applicantMW, ticketController.createTicket.bind(ticketController));
router.put('/tickets/:id', ...applicantMW, ticketController.updateTicket.bind(ticketController));
router.post('/tickets/:id/apply-sponsorship', ...applicantMW, ticketController.applySponsorship.bind(ticketController));
router.post('/tickets/:id/refund-choice', ...applicantMW, ticketController.processRefundChoice.bind(ticketController));
router.post('/tickets/:id/pay-aveling', ...applicantMW, ticketController.payTicketOnAveling.bind(ticketController));
router.post('/tickets/:id/exam-outcome', ...applicantMW, ticketController.recordExamOutcome.bind(ticketController));
router.post('/tickets/:id/set-review-awaiting', ...applicantMW, ticketController.setExamReviewAwaiting.bind(ticketController));

// STK-APP-PAY-001: payment details with bank account routing
router.get('/payments/:id', ...applicantMW, paymentController.getPaymentDetails.bind(paymentController));
// STK-APP-PAY-002, STK-APP-PAY-003: upload proof
router.post('/payments/:id/proof', ...applicantMW, paymentController.uploadProof.bind(paymentController));

// STK-APP-NOTIF-001..003, TRUST-008: notifications
router.get('/notifications', ...applicantMW, notificationController.getUserNotifications.bind(notificationController));
router.put('/notifications/mark-all-read', ...applicantMW, notificationController.markAllRead.bind(notificationController));
router.put('/notifications/:id/read', ...applicantMW, notificationController.markAsRead.bind(notificationController));
router.post('/notifications/subscribe', ...applicantMW, notificationController.subscribeToPush.bind(notificationController));

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

// STK-ADM-PAY-003: unpaid payments view
router.get('/admin/payments/unpaid', ...adminMW, paymentController.getPendingPaymentsAdmin.bind(paymentController));
// STK-ADM-PAY-004: unverified payments (screenshot uploaded, not confirmed)
router.get('/admin/payments/unverified', ...adminMW, paymentController.getUnverifiedPaymentsAdmin.bind(paymentController));
// STK-ADM-PAY-001, STK-ADM-PAY-002: verify payment
router.post('/admin/payments/:id/verify', ...adminMW, paymentController.verifyPayment.bind(paymentController));

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
router.get('/admin/conditions', ...adminMW, adminController.getAllConditions.bind(adminController));
router.get('/admin/conditions/:id', ...adminMW, adminController.getConditionById.bind(adminController));
router.get('/admin/benefits', ...adminMW, adminController.getAllBenefits.bind(adminController));
router.get('/admin/benefits/:id', ...adminMW, adminController.getBenefitById.bind(adminController));
router.post('/admin/categories', ...adminMW, adminController.createCategory.bind(adminController));
router.put('/admin/categories/:id', ...adminMW, adminController.updateCategory.bind(adminController));
router.delete('/admin/categories/:id', ...adminMW, adminController.deleteCategory.bind(adminController));

// STK-ADM-COND-001..003
router.post('/admin/conditions', ...adminMW, adminController.createCondition.bind(adminController));
router.put('/admin/conditions/:id', ...adminMW, adminController.updateCondition.bind(adminController));
router.delete('/admin/conditions/:id', ...adminMW, adminController.deleteCondition.bind(adminController));

// STK-ADM-BEN-001..004
router.post('/admin/benefits', ...adminMW, adminController.createBenefit.bind(adminController));
router.put('/admin/benefits/:id', ...adminMW, adminController.updateBenefit.bind(adminController));
router.delete('/admin/benefits/:id', ...adminMW, adminController.deleteBenefit.bind(adminController));

// REG-004: admin user management
router.get('/admin/users/:id', ...adminMW, adminController.getApplicantById.bind(adminController));
router.get('/admin/users', ...adminMW, adminController.getAllApplicants.bind(adminController));
router.delete('/admin/users/:id', ...adminMW, adminController.deleteApplicant.bind(adminController));
router.post('/admin/users/:id/welcome-mail', ...adminMW, adminController.sendWelcomeMail.bind(adminController));
router.post('/admin/users/:id/eoi-mail', ...adminMW, adminController.sendEOIMail.bind(adminController));
router.put('/admin/users/:id/wallet', ...adminMW, adminController.updateApplicantWallet.bind(adminController));
router.put('/admin/users/:id/aveling-credentials', ...adminMW, adminController.updateAvelingCredentials.bind(adminController));
router.put('/admin/users/:id/admin-stage', ...adminMW, adminController.updateApplicantAdminStage.bind(adminController));
router.put('/admin/applicants/:id/aveling-credentials', ...adminMW, adminController.updateAvelingCredentials.bind(adminController));

// Candidate Portal Lookup & Payment Email Routes
router.post('/candidate/lookup', apiLimiter, ticketController.candidateLookup.bind(ticketController));
router.post('/tickets/:id/checkout-email', apiLimiter, ticketController.sendCheckoutPaymentEmail.bind(ticketController));

// Admin Ticket Management Routes
router.get('/admin/tickets', ...adminMW, ticketController.adminGetAllTickets.bind(ticketController));
router.put('/admin/tickets/:id', ...adminMW, ticketController.adminUpdateTicket.bind(ticketController));
router.delete('/admin/tickets/:id', ...adminMW, ticketController.adminDeleteTicket.bind(ticketController));
router.post('/admin/tickets/bulk-seed', ...adminMW, ticketController.adminBulkSeedTickets.bind(ticketController));
router.post('/admin/tickets/clone', ...adminMW, ticketController.cloneTicketForApplicant.bind(ticketController));
router.post('/admin/tickets/:id/approve-receipt', ...adminMW, ticketController.adminApproveReceipt.bind(ticketController));
router.post('/admin/applications/:id/tickets', ...adminMW, ticketController.adminAddApplicationTicket.bind(ticketController));
router.post('/admin/tickets/:id/generate-credentials', ...adminMW, ticketController.adminGenerateAvelingCredentials.bind(ticketController));
router.post('/admin/tickets/:id/validate-payment', ...adminMW, ticketController.adminValidatePayment.bind(ticketController));
router.post('/admin/tickets/:id/approve-exam', ...adminMW, ticketController.adminApproveExamResult.bind(ticketController));
// Expose platform bank to public/applicants (for checkout on Aveling)
router.get('/platform-bank', ticketController.getPlatformBank.bind(ticketController));

router.get('/admin/platform-bank', ...adminMW, ticketController.getPlatformBank.bind(ticketController));
router.put('/admin/platform-bank', ...adminMW, ticketController.updatePlatformBank.bind(ticketController));

// Prefill Stages
router.get('/admin/prefill-stages', ...adminMW, prefillStageController.getPrefillStages.bind(prefillStageController));
router.post('/admin/prefill-stages', ...adminMW, prefillStageController.createPrefillStage.bind(prefillStageController));
router.put('/admin/prefill-stages/:id', ...adminMW, prefillStageController.updatePrefillStage.bind(prefillStageController));
router.delete('/admin/prefill-stages/:id', ...adminMW, prefillStageController.deletePrefillStage.bind(prefillStageController));
router.post('/admin/prefill-stages/reorder', ...adminMW, prefillStageController.reorderPrefillStages.bind(prefillStageController));

// Candidate receipt submission (public or candidate authenticated)
router.post('/tickets/:id/submit-receipt', ticketController.submitReceipt.bind(ticketController));


import { interestController } from '../controllers/InterestController';
import { ticketCatalogController } from '../controllers/TicketCatalogController';

// Expression of Interest Routes
router.post('/interests', ...applicantMW, interestController.createInterest.bind(interestController));
router.put('/interests/me', ...applicantMW, interestController.updateInterest.bind(interestController));
router.get('/interests/me', ...applicantMW, interestController.getUserInterest.bind(interestController));
router.get('/admin/interests', ...adminMW, interestController.getAllInterests.bind(interestController));
router.delete('/admin/interests/:id', ...adminMW, interestController.deleteInterest.bind(interestController));

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

// Admin Practical Criteria Management
router.get('/practical-assessments/courses/:courseId/criteria', ...adminMW, practicalAssessmentController.getCriteria.bind(practicalAssessmentController));
router.post('/practical-assessments/courses/:courseId/criteria', ...adminMW, practicalAssessmentController.addCriterion.bind(practicalAssessmentController));
router.put('/practical-assessments/criteria/:criterionId', ...adminMW, practicalAssessmentController.updateCriterion.bind(practicalAssessmentController));
router.delete('/practical-assessments/criteria/:criterionId', ...adminMW, practicalAssessmentController.deleteCriterion.bind(practicalAssessmentController));

// Learner Exam Attempts
router.get('/exams/attempts/:attemptId', ...applicantMW, examAttemptController.getAttemptDetails.bind(examAttemptController));
router.post('/exams/attempts/start', ...applicantMW, examAttemptController.startAttempt.bind(examAttemptController));
router.post('/exams/attempts/:attemptId/answers', ...applicantMW, examAttemptController.saveAnswers.bind(examAttemptController));
router.post('/exams/attempts/:attemptId/submit', ...applicantMW, examAttemptController.submitAttempt.bind(examAttemptController));
router.get('/exams/attempts/:attemptId/result', ...applicantMW, examAttemptController.getAttemptResult.bind(examAttemptController));

// Learner/Admin Practical Sessions
router.get('/practical-sessions/prerequisite-check/:courseId', ...applicantMW, practicalSessionController.checkPrerequisites.bind(practicalSessionController));
router.get('/practical-sessions/available-slots', ...applicantMW, practicalSessionController.getAvailableSlots.bind(practicalSessionController));
router.post('/practical-sessions/bookings', ...applicantMW, practicalSessionController.bookSession.bind(practicalSessionController));
router.delete('/practical-sessions/bookings/:bookingId', ...applicantMW, practicalSessionController.cancelBooking.bind(practicalSessionController));
router.get('/practical-sessions/:sessionId/roster', ...adminMW, practicalSessionController.getRoster.bind(practicalSessionController));
router.post('/practical-sessions/:sessionId/attendance', ...adminMW, practicalSessionController.markAttendance.bind(practicalSessionController));

// Certificates
router.get('/certificates/learner/me', ...applicantMW, certificateController.getMyCertificates.bind(certificateController));
router.post('/certificates/issue', ...adminMW, certificateController.issueCertificate.bind(certificateController));

export default router;
