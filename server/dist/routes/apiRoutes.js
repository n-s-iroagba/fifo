"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const JobController_1 = require("../controllers/JobController");
const ApplicationController_1 = require("../controllers/ApplicationController");
const PaymentController_1 = require("../controllers/PaymentController");
const AdminController_1 = require("../controllers/AdminController");
const NotificationController_1 = require("../controllers/NotificationController");
const CvController_1 = require("../controllers/CvController");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const rateLimiter_1 = require("../utils/rateLimiter");
const constants_1 = require("../constants");
const multer_1 = __importDefault(require("multer"));
const auditMiddleware_1 = require("../middleware/auditMiddleware");
const LmsAuthController_1 = require("../controllers/LmsAuthController");
const CourseController_1 = require("../controllers/CourseController");
const ExamController_1 = require("../controllers/ExamController");
const PracticalAssessmentController_1 = require("../controllers/PracticalAssessmentController");
const ExamAttemptController_1 = require("../controllers/ExamAttemptController");
const PracticalSessionController_1 = require("../controllers/PracticalSessionController");
const CertificateController_1 = require("../controllers/CertificateController");
const TicketController_1 = require("../controllers/TicketController");
const PrefillStageController_1 = require("../controllers/PrefillStageController");
const prefillStageController = new PrefillStageController_1.PrefillStageController();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per file
});
const router = (0, express_1.Router)();
// Apply Audit Alert to all routes
router.use(auditMiddleware_1.applicantAuditMiddleware);
// =======================
// Public Routes
// =======================
// STK-APP-AUTH-004: email/password registration and login (NFR-SEC-008: rate limited)
router.use('/auth', rateLimiter_1.authLimiter);
router.post('/auth/register', AuthController_1.authController.register.bind(AuthController_1.authController));
router.post('/auth/register-admin', AuthController_1.authController.registerAdmin.bind(AuthController_1.authController));
router.post('/auth/login', AuthController_1.authController.login.bind(AuthController_1.authController));
router.post('/auth/refresh', AuthController_1.authController.refresh.bind(AuthController_1.authController));
router.post('/auth/logout', AuthController_1.authController.logout.bind(AuthController_1.authController));
router.get('/auth/me', auth_1.requireAuth, AuthController_1.authController.getMe.bind(AuthController_1.authController));
router.put('/auth/profile', auth_1.requireAuth, AuthController_1.authController.updateProfile.bind(AuthController_1.authController));
router.get('/auth/verify-email', AuthController_1.authController.verifyEmail.bind(AuthController_1.authController));
router.post('/auth/forgot-password', AuthController_1.authController.forgotPassword.bind(AuthController_1.authController));
router.post('/auth/reset-password', AuthController_1.authController.resetPassword.bind(AuthController_1.authController));
router.post('/auth/resend-verification', AuthController_1.authController.resendVerification.bind(AuthController_1.authController));
router.put('/auth/change-password', auth_1.requireAuth, AuthController_1.authController.changePassword.bind(AuthController_1.authController));
// STK-APP-AUTH-001, STK-ADM-JOB-004: public job listings
router.use('/jobs', rateLimiter_1.apiLimiter);
router.get('/jobs', JobController_1.jobController.getActiveJobs.bind(JobController_1.jobController));
router.get('/jobs/:id', JobController_1.jobController.getJobDetails.bind(JobController_1.jobController));
// =======================
// Applicant Routes (requireAuth + APPLICANT role)
// =======================
const applicantMW = [auth_1.requireAuth, (0, rbac_1.requireRole)([constants_1.CONSTANTS.ROLES.APPLICANT]), rateLimiter_1.apiLimiter];
// STK-APP-DASH-001..003
router.get('/dashboard', ...applicantMW, ApplicationController_1.applicationController.getDashboardSummary.bind(ApplicationController_1.applicationController));
// STK-APP-APPLY-001..005
router.post('/applications', ...applicantMW, ApplicationController_1.applicationController.startApplication.bind(ApplicationController_1.applicationController));
router.get('/applications', ...applicantMW, ApplicationController_1.applicationController.getUserApplications.bind(ApplicationController_1.applicationController));
router.get('/applications/:id', ...applicantMW, ApplicationController_1.applicationController.getApplicationDetails.bind(ApplicationController_1.applicationController));
router.post('/applications/:id/advance', ...applicantMW, ApplicationController_1.applicationController.advanceApplication.bind(ApplicationController_1.applicationController));
router.post('/applications/:id/visa-sponsorship', ...applicantMW, ApplicationController_1.applicationController.applyVisaSponsorship.bind(ApplicationController_1.applicationController));
// STK-APP-CV-001..004
router.get('/cv', ...applicantMW, CvController_1.cvController.getCv.bind(CvController_1.cvController));
router.post('/cv', ...applicantMW, CvController_1.cvController.uploadCv.bind(CvController_1.cvController));
router.put('/cv', ...applicantMW, CvController_1.cvController.updateCv.bind(CvController_1.cvController));
router.delete('/cv', ...applicantMW, CvController_1.cvController.deleteCv.bind(CvController_1.cvController));
// Ticket Sponsorship & Management Routes
router.get('/tickets', ...applicantMW, TicketController_1.ticketController.getUserTickets.bind(TicketController_1.ticketController));
router.get('/tickets/:id', ...applicantMW, TicketController_1.ticketController.getTicketById.bind(TicketController_1.ticketController));
router.post('/tickets', ...applicantMW, TicketController_1.ticketController.createTicket.bind(TicketController_1.ticketController));
router.put('/tickets/:id', ...applicantMW, TicketController_1.ticketController.updateTicket.bind(TicketController_1.ticketController));
router.post('/tickets/:id/apply-sponsorship', ...applicantMW, TicketController_1.ticketController.applySponsorship.bind(TicketController_1.ticketController));
router.post('/tickets/:id/refund-choice', ...applicantMW, TicketController_1.ticketController.processRefundChoice.bind(TicketController_1.ticketController));
router.post('/tickets/:id/pay-aveling', ...applicantMW, TicketController_1.ticketController.payTicketOnAveling.bind(TicketController_1.ticketController));
router.post('/tickets/:id/exam-outcome', ...applicantMW, TicketController_1.ticketController.recordExamOutcome.bind(TicketController_1.ticketController));
router.post('/tickets/:id/set-review-awaiting', ...applicantMW, TicketController_1.ticketController.setExamReviewAwaiting.bind(TicketController_1.ticketController));
// STK-APP-PAY-001: payment details with bank account routing
router.get('/payments/:id', ...applicantMW, PaymentController_1.paymentController.getPaymentDetails.bind(PaymentController_1.paymentController));
// STK-APP-PAY-002, STK-APP-PAY-003: upload proof
router.post('/payments/:id/proof', ...applicantMW, PaymentController_1.paymentController.uploadProof.bind(PaymentController_1.paymentController));
// STK-APP-NOTIF-001..003, TRUST-008: notifications
router.get('/notifications', ...applicantMW, NotificationController_1.notificationController.getUserNotifications.bind(NotificationController_1.notificationController));
router.put('/notifications/mark-all-read', ...applicantMW, NotificationController_1.notificationController.markAllRead.bind(NotificationController_1.notificationController));
router.put('/notifications/:id/read', ...applicantMW, NotificationController_1.notificationController.markAsRead.bind(NotificationController_1.notificationController));
router.post('/notifications/subscribe', ...applicantMW, NotificationController_1.notificationController.subscribeToPush.bind(NotificationController_1.notificationController));
// =======================
// Admin Routes (requireAuth + ADMIN role) — NFR-SEC-004
// =======================
const adminMW = [auth_1.requireAuth, (0, rbac_1.requireRole)([constants_1.CONSTANTS.ROLES.ADMIN]), rateLimiter_1.apiLimiter];
// STK-ADM-HEALTH-001..003
router.get('/admin/health', ...adminMW, AdminController_1.adminController.getHealth.bind(AdminController_1.adminController));
// STK-ADM-APP-001: new/completed applications
router.get('/admin/applications', ...adminMW, ApplicationController_1.applicationController.getAdminApplications.bind(ApplicationController_1.applicationController));
// STK-ADM-APP-002: draft applications
router.get('/admin/applications/drafts', ...adminMW, ApplicationController_1.applicationController.getDraftApplications.bind(ApplicationController_1.applicationController));
// STK-ADM-APP-003, STK-ADM-APP-004: send mail/push to applicant
router.post('/admin/mail', ...adminMW, upload.array('attachments'), AdminController_1.adminController.sendMailToApplicant.bind(AdminController_1.adminController));
// New: manage ad-hoc stages for specific applications
router.post('/admin/applications/:id/stages', ...adminMW, ApplicationController_1.applicationController.addStage.bind(ApplicationController_1.applicationController));
router.get('/admin/applications/:id/stages/:stageId', ...adminMW, ApplicationController_1.applicationController.getStageDetails.bind(ApplicationController_1.applicationController));
router.put('/admin/applications/:id/stages/:stageId', ...adminMW, ApplicationController_1.applicationController.updateStage.bind(ApplicationController_1.applicationController));
router.delete('/admin/applications/:id/stages/:stageId', ...adminMW, ApplicationController_1.applicationController.deleteStage.bind(ApplicationController_1.applicationController));
router.post('/admin/applications/:id/stages/:stageId/complete', ...adminMW, ApplicationController_1.applicationController.completeApplicationStage.bind(ApplicationController_1.applicationController));
router.post('/admin/applications/:id/complete', ...adminMW, ApplicationController_1.applicationController.completeApplication.bind(ApplicationController_1.applicationController));
router.delete('/admin/applications/:id', ...adminMW, ApplicationController_1.applicationController.deleteApplication.bind(ApplicationController_1.applicationController));
router.get('/admin/applications/:id', ...adminMW, ApplicationController_1.applicationController.getApplicationDetails.bind(ApplicationController_1.applicationController));
router.put('/admin/applications/:id/visa-sponsorship', ...adminMW, ApplicationController_1.applicationController.updateVisaSponsorshipStatus.bind(ApplicationController_1.applicationController));
// STK-ADM-PAY-003: unpaid payments view
router.get('/admin/payments/unpaid', ...adminMW, PaymentController_1.paymentController.getPendingPaymentsAdmin.bind(PaymentController_1.paymentController));
// STK-ADM-PAY-004: unverified payments (screenshot uploaded, not confirmed)
router.get('/admin/payments/unverified', ...adminMW, PaymentController_1.paymentController.getUnverifiedPaymentsAdmin.bind(PaymentController_1.paymentController));
// STK-ADM-PAY-001, STK-ADM-PAY-002: verify payment
router.post('/admin/payments/:id/verify', ...adminMW, PaymentController_1.paymentController.verifyPayment.bind(PaymentController_1.paymentController));
// STK-ADM-JOB-001..005
router.get('/admin/jobs/stats', ...adminMW, JobController_1.jobController.getJobStats.bind(JobController_1.jobController));
router.get('/admin/jobs', ...adminMW, JobController_1.jobController.getAllJobsAdmin.bind(JobController_1.jobController));
router.get('/admin/jobs/:id', ...adminMW, JobController_1.jobController.getJobDetails.bind(JobController_1.jobController));
router.post('/admin/jobs', ...adminMW, JobController_1.jobController.createJob.bind(JobController_1.jobController));
router.put('/admin/jobs/:id', ...adminMW, JobController_1.jobController.updateJob.bind(JobController_1.jobController));
router.delete('/admin/jobs/:id', ...adminMW, JobController_1.jobController.deleteJob.bind(JobController_1.jobController));
// STK-ADM-BANK-001..004
router.get('/admin/finance/configs', ...adminMW, AdminController_1.adminController.getFinancialConfigs.bind(AdminController_1.adminController));
router.get('/admin/bank-accounts', ...adminMW, AdminController_1.adminController.getAllBankAccounts.bind(AdminController_1.adminController));
// Public route for candidates to fetch bank details for checkout
router.get('/bank-accounts', AdminController_1.adminController.getAllBankAccounts.bind(AdminController_1.adminController));
router.get('/admin/bank-accounts/:id', ...adminMW, AdminController_1.adminController.getBankAccountById.bind(AdminController_1.adminController));
router.get('/admin/finance/bank-accounts/by-amount', ...adminMW, AdminController_1.adminController.getBankAccountsForAmount.bind(AdminController_1.adminController));
router.post('/admin/bank-accounts', ...adminMW, AdminController_1.adminController.createBankAccount.bind(AdminController_1.adminController));
router.put('/admin/bank-accounts/:id', ...adminMW, AdminController_1.adminController.updateBankAccount.bind(AdminController_1.adminController));
router.delete('/admin/bank-accounts/:id', ...adminMW, AdminController_1.adminController.deleteBankAccount.bind(AdminController_1.adminController));
// STK-ADM-CAT-001..003
router.get('/admin/jobs/metadata', ...adminMW, AdminController_1.adminController.getJobConfigs.bind(AdminController_1.adminController));
router.get('/admin/categories', ...adminMW, AdminController_1.adminController.getAllCategories.bind(AdminController_1.adminController));
router.get('/admin/categories/:id', ...adminMW, AdminController_1.adminController.getCategoryById.bind(AdminController_1.adminController));
router.get('/admin/conditions', ...adminMW, AdminController_1.adminController.getAllConditions.bind(AdminController_1.adminController));
router.get('/admin/conditions/:id', ...adminMW, AdminController_1.adminController.getConditionById.bind(AdminController_1.adminController));
router.get('/admin/benefits', ...adminMW, AdminController_1.adminController.getAllBenefits.bind(AdminController_1.adminController));
router.get('/admin/benefits/:id', ...adminMW, AdminController_1.adminController.getBenefitById.bind(AdminController_1.adminController));
router.post('/admin/categories', ...adminMW, AdminController_1.adminController.createCategory.bind(AdminController_1.adminController));
router.put('/admin/categories/:id', ...adminMW, AdminController_1.adminController.updateCategory.bind(AdminController_1.adminController));
router.delete('/admin/categories/:id', ...adminMW, AdminController_1.adminController.deleteCategory.bind(AdminController_1.adminController));
// STK-ADM-COND-001..003
router.post('/admin/conditions', ...adminMW, AdminController_1.adminController.createCondition.bind(AdminController_1.adminController));
router.put('/admin/conditions/:id', ...adminMW, AdminController_1.adminController.updateCondition.bind(AdminController_1.adminController));
router.delete('/admin/conditions/:id', ...adminMW, AdminController_1.adminController.deleteCondition.bind(AdminController_1.adminController));
// STK-ADM-BEN-001..004
router.post('/admin/benefits', ...adminMW, AdminController_1.adminController.createBenefit.bind(AdminController_1.adminController));
router.put('/admin/benefits/:id', ...adminMW, AdminController_1.adminController.updateBenefit.bind(AdminController_1.adminController));
router.delete('/admin/benefits/:id', ...adminMW, AdminController_1.adminController.deleteBenefit.bind(AdminController_1.adminController));
// REG-004: admin user management
router.get('/admin/users/:id', ...adminMW, AdminController_1.adminController.getApplicantById.bind(AdminController_1.adminController));
router.get('/admin/users', ...adminMW, AdminController_1.adminController.getAllApplicants.bind(AdminController_1.adminController));
router.delete('/admin/users/:id', ...adminMW, AdminController_1.adminController.deleteApplicant.bind(AdminController_1.adminController));
router.post('/admin/users/:id/welcome-mail', ...adminMW, AdminController_1.adminController.sendWelcomeMail.bind(AdminController_1.adminController));
router.post('/admin/users/:id/eoi-mail', ...adminMW, AdminController_1.adminController.sendEOIMail.bind(AdminController_1.adminController));
router.put('/admin/users/:id/wallet', ...adminMW, AdminController_1.adminController.updateApplicantWallet.bind(AdminController_1.adminController));
router.put('/admin/users/:id/aveling-credentials', ...adminMW, AdminController_1.adminController.updateAvelingCredentials.bind(AdminController_1.adminController));
router.put('/admin/users/:id/admin-stage', ...adminMW, AdminController_1.adminController.updateApplicantAdminStage.bind(AdminController_1.adminController));
router.put('/admin/applicants/:id/aveling-credentials', ...adminMW, AdminController_1.adminController.updateAvelingCredentials.bind(AdminController_1.adminController));
// Candidate Portal Lookup & Payment Email Routes
router.post('/candidate/lookup', rateLimiter_1.apiLimiter, TicketController_1.ticketController.candidateLookup.bind(TicketController_1.ticketController));
router.post('/tickets/:id/checkout-email', rateLimiter_1.apiLimiter, TicketController_1.ticketController.sendCheckoutPaymentEmail.bind(TicketController_1.ticketController));
// Admin Ticket Management Routes
router.get('/admin/tickets', ...adminMW, TicketController_1.ticketController.adminGetAllTickets.bind(TicketController_1.ticketController));
router.put('/admin/tickets/:id', ...adminMW, TicketController_1.ticketController.adminUpdateTicket.bind(TicketController_1.ticketController));
router.delete('/admin/tickets/:id', ...adminMW, TicketController_1.ticketController.adminDeleteTicket.bind(TicketController_1.ticketController));
router.post('/admin/tickets/bulk-seed', ...adminMW, TicketController_1.ticketController.adminBulkSeedTickets.bind(TicketController_1.ticketController));
router.post('/admin/tickets/clone', ...adminMW, TicketController_1.ticketController.cloneTicketForApplicant.bind(TicketController_1.ticketController));
router.post('/admin/tickets/:id/approve-receipt', ...adminMW, TicketController_1.ticketController.adminApproveReceipt.bind(TicketController_1.ticketController));
router.post('/admin/applications/:id/tickets', ...adminMW, TicketController_1.ticketController.adminAddApplicationTicket.bind(TicketController_1.ticketController));
router.post('/admin/tickets/:id/generate-credentials', ...adminMW, TicketController_1.ticketController.adminGenerateAvelingCredentials.bind(TicketController_1.ticketController));
router.post('/admin/tickets/:id/validate-payment', ...adminMW, TicketController_1.ticketController.adminValidatePayment.bind(TicketController_1.ticketController));
router.post('/admin/tickets/:id/approve-exam', ...adminMW, TicketController_1.ticketController.adminApproveExamResult.bind(TicketController_1.ticketController));
// Expose platform bank to public/applicants (for checkout on Aveling)
router.get('/platform-bank', TicketController_1.ticketController.getPlatformBank.bind(TicketController_1.ticketController));
router.get('/admin/platform-bank', ...adminMW, TicketController_1.ticketController.getPlatformBank.bind(TicketController_1.ticketController));
router.put('/admin/platform-bank', ...adminMW, TicketController_1.ticketController.updatePlatformBank.bind(TicketController_1.ticketController));
// Prefill Stages
router.get('/admin/prefill-stages', ...adminMW, prefillStageController.getPrefillStages.bind(prefillStageController));
router.post('/admin/prefill-stages', ...adminMW, prefillStageController.createPrefillStage.bind(prefillStageController));
router.put('/admin/prefill-stages/:id', ...adminMW, prefillStageController.updatePrefillStage.bind(prefillStageController));
router.delete('/admin/prefill-stages/:id', ...adminMW, prefillStageController.deletePrefillStage.bind(prefillStageController));
router.post('/admin/prefill-stages/reorder', ...adminMW, prefillStageController.reorderPrefillStages.bind(prefillStageController));
// Candidate receipt submission (public or candidate authenticated)
router.post('/tickets/:id/submit-receipt', TicketController_1.ticketController.submitReceipt.bind(TicketController_1.ticketController));
const InterestController_1 = require("../controllers/InterestController");
const TicketCatalogController_1 = require("../controllers/TicketCatalogController");
// Expression of Interest Routes
router.post('/interests', ...applicantMW, InterestController_1.interestController.createInterest.bind(InterestController_1.interestController));
router.put('/interests/me', ...applicantMW, InterestController_1.interestController.updateInterest.bind(InterestController_1.interestController));
router.get('/interests/me', ...applicantMW, InterestController_1.interestController.getUserInterest.bind(InterestController_1.interestController));
router.get('/admin/interests', ...adminMW, InterestController_1.interestController.getAllInterests.bind(InterestController_1.interestController));
router.delete('/admin/interests/:id', ...adminMW, InterestController_1.interestController.deleteInterest.bind(InterestController_1.interestController));
// =======================
// Ticket Catalog Routes
// =======================
router.get('/ticket-catalogs', TicketCatalogController_1.ticketCatalogController.getAll.bind(TicketCatalogController_1.ticketCatalogController));
router.post('/admin/ticket-catalogs', ...adminMW, TicketCatalogController_1.ticketCatalogController.create.bind(TicketCatalogController_1.ticketCatalogController));
router.put('/admin/ticket-catalogs/:id', ...adminMW, TicketCatalogController_1.ticketCatalogController.updateTicketCatalog.bind(TicketCatalogController_1.ticketCatalogController));
router.delete('/admin/ticket-catalogs/:id', ...adminMW, TicketCatalogController_1.ticketCatalogController.deleteTicketCatalog.bind(TicketCatalogController_1.ticketCatalogController));
router.post('/admin/seed', ...adminMW, AdminController_1.adminController.triggerSeed.bind(AdminController_1.adminController));
// =======================
// LMS Routes
// =======================
// Public LMS Auth (STEP-031)
router.use('/lms-auth', rateLimiter_1.apiLimiter);
router.post('/lms-auth/login', LmsAuthController_1.lmsAuthController.login.bind(LmsAuthController_1.lmsAuthController));
// Admin LMS Credential Management (STEP-030)
router.get('/lms-credentials/applicants/:applicantId', ...adminMW, LmsAuthController_1.lmsAuthController.getLmsCredentialsStatus.bind(LmsAuthController_1.lmsAuthController));
router.post('/lms-credentials/generate', ...adminMW, LmsAuthController_1.lmsAuthController.generateCredentials.bind(LmsAuthController_1.lmsAuthController));
// Admin Course Management (STEP-001 - STEP-006)
router.get('/courses', CourseController_1.courseController.getPublishedCourses.bind(CourseController_1.courseController));
router.get('/courses/:id', CourseController_1.courseController.getCourseById.bind(CourseController_1.courseController));
router.get('/courses/certifications/lookup', ...adminMW, CourseController_1.courseController.getCertificationTypes.bind(CourseController_1.courseController));
router.post('/courses', ...adminMW, CourseController_1.courseController.createCourse.bind(CourseController_1.courseController));
router.get('/courses/admin/all', ...adminMW, CourseController_1.courseController.getAllAdminCourses.bind(CourseController_1.courseController));
router.patch('/courses/:id/publish', ...adminMW, CourseController_1.courseController.togglePublish.bind(CourseController_1.courseController));
router.post('/courses/bulk-import', ...adminMW, CourseController_1.courseController.bulkImport.bind(CourseController_1.courseController));
router.get('/courses/:id/modules', ...adminMW, CourseController_1.courseController.getModules.bind(CourseController_1.courseController));
router.post('/courses/:id/modules', ...adminMW, CourseController_1.courseController.addModule.bind(CourseController_1.courseController));
router.put('/courses/:id/modules/:moduleId', ...adminMW, CourseController_1.courseController.updateModule.bind(CourseController_1.courseController));
router.delete('/courses/:id/modules/:moduleId', ...adminMW, CourseController_1.courseController.deleteModule.bind(CourseController_1.courseController));
// Admin Exam Management
router.get('/exams/courses/:courseId/question-bank', ...adminMW, ExamController_1.examController.getQuestionBank.bind(ExamController_1.examController));
router.post('/exams/courses/:courseId/questions', ...adminMW, ExamController_1.examController.addQuestion.bind(ExamController_1.examController));
router.put('/exams/questions/:questionId', ...adminMW, ExamController_1.examController.updateQuestion.bind(ExamController_1.examController));
router.put('/exams/courses/:courseId/settings', ...adminMW, ExamController_1.examController.updateSettings.bind(ExamController_1.examController));
router.delete('/exams/questions/:questionId', ...adminMW, ExamController_1.examController.deleteQuestion.bind(ExamController_1.examController));
// Admin Practical Criteria Management
router.get('/practical-assessments/courses/:courseId/criteria', ...adminMW, PracticalAssessmentController_1.practicalAssessmentController.getCriteria.bind(PracticalAssessmentController_1.practicalAssessmentController));
router.post('/practical-assessments/courses/:courseId/criteria', ...adminMW, PracticalAssessmentController_1.practicalAssessmentController.addCriterion.bind(PracticalAssessmentController_1.practicalAssessmentController));
router.put('/practical-assessments/criteria/:criterionId', ...adminMW, PracticalAssessmentController_1.practicalAssessmentController.updateCriterion.bind(PracticalAssessmentController_1.practicalAssessmentController));
router.delete('/practical-assessments/criteria/:criterionId', ...adminMW, PracticalAssessmentController_1.practicalAssessmentController.deleteCriterion.bind(PracticalAssessmentController_1.practicalAssessmentController));
// Learner Exam Attempts
router.get('/exams/attempts/:attemptId', ...applicantMW, ExamAttemptController_1.examAttemptController.getAttemptDetails.bind(ExamAttemptController_1.examAttemptController));
router.post('/exams/attempts/start', ...applicantMW, ExamAttemptController_1.examAttemptController.startAttempt.bind(ExamAttemptController_1.examAttemptController));
router.post('/exams/attempts/:attemptId/answers', ...applicantMW, ExamAttemptController_1.examAttemptController.saveAnswers.bind(ExamAttemptController_1.examAttemptController));
router.post('/exams/attempts/:attemptId/submit', ...applicantMW, ExamAttemptController_1.examAttemptController.submitAttempt.bind(ExamAttemptController_1.examAttemptController));
router.get('/exams/attempts/:attemptId/result', ...applicantMW, ExamAttemptController_1.examAttemptController.getAttemptResult.bind(ExamAttemptController_1.examAttemptController));
// Learner/Admin Practical Sessions
router.get('/practical-sessions/prerequisite-check/:courseId', ...applicantMW, PracticalSessionController_1.practicalSessionController.checkPrerequisites.bind(PracticalSessionController_1.practicalSessionController));
router.get('/practical-sessions/available-slots', ...applicantMW, PracticalSessionController_1.practicalSessionController.getAvailableSlots.bind(PracticalSessionController_1.practicalSessionController));
router.post('/practical-sessions/bookings', ...applicantMW, PracticalSessionController_1.practicalSessionController.bookSession.bind(PracticalSessionController_1.practicalSessionController));
router.delete('/practical-sessions/bookings/:bookingId', ...applicantMW, PracticalSessionController_1.practicalSessionController.cancelBooking.bind(PracticalSessionController_1.practicalSessionController));
router.get('/practical-sessions/:sessionId/roster', ...adminMW, PracticalSessionController_1.practicalSessionController.getRoster.bind(PracticalSessionController_1.practicalSessionController));
router.post('/practical-sessions/:sessionId/attendance', ...adminMW, PracticalSessionController_1.practicalSessionController.markAttendance.bind(PracticalSessionController_1.practicalSessionController));
// Certificates
router.get('/certificates/learner/me', ...applicantMW, CertificateController_1.certificateController.getMyCertificates.bind(CertificateController_1.certificateController));
router.post('/certificates/issue', ...adminMW, CertificateController_1.certificateController.issueCertificate.bind(CertificateController_1.certificateController));
exports.default = router;
