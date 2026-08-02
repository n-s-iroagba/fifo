"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = exports.Certificate = exports.ExamAttempt = exports.PracticalBooking = exports.PracticalSession = exports.Enrollment = exports.CourseSubsidy = exports.CertificationGap = exports.PracticalCriterion = exports.ExamQuestion = exports.ExamConfig = exports.CourseModule = exports.Course = exports.CertificationType = exports.LmsCredential = exports.PushSubscription = exports.Interest = exports.Notification = exports.Payment = exports.Application = exports.JobStage = exports.JobCondition = exports.JobBenefit = exports.JobListing = exports.JobCategory = exports.CryptoWallet = exports.BankAccount = exports.User = exports.sequelize = void 0;
const database_1 = require("../config/database");
Object.defineProperty(exports, "sequelize", { enumerable: true, get: function () { return database_1.sequelize; } });
const User_1 = require("./User");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return User_1.User; } });
const BankAccount_1 = require("./BankAccount");
Object.defineProperty(exports, "BankAccount", { enumerable: true, get: function () { return BankAccount_1.BankAccount; } });
const CryptoWallet_1 = require("./CryptoWallet");
Object.defineProperty(exports, "CryptoWallet", { enumerable: true, get: function () { return CryptoWallet_1.CryptoWallet; } });
const JobCategory_1 = require("./JobCategory");
Object.defineProperty(exports, "JobCategory", { enumerable: true, get: function () { return JobCategory_1.JobCategory; } });
const JobListing_1 = require("./JobListing");
Object.defineProperty(exports, "JobListing", { enumerable: true, get: function () { return JobListing_1.JobListing; } });
const JobBenefit_1 = require("./JobBenefit");
Object.defineProperty(exports, "JobBenefit", { enumerable: true, get: function () { return JobBenefit_1.JobBenefit; } });
const JobCondition_1 = require("./JobCondition");
Object.defineProperty(exports, "JobCondition", { enumerable: true, get: function () { return JobCondition_1.JobCondition; } });
const JobStage_1 = require("./JobStage");
Object.defineProperty(exports, "JobStage", { enumerable: true, get: function () { return JobStage_1.JobStage; } });
const Application_1 = require("./Application");
Object.defineProperty(exports, "Application", { enumerable: true, get: function () { return Application_1.Application; } });
const Payment_1 = require("./Payment");
Object.defineProperty(exports, "Payment", { enumerable: true, get: function () { return Payment_1.Payment; } });
const Notification_1 = require("./Notification");
Object.defineProperty(exports, "Notification", { enumerable: true, get: function () { return Notification_1.Notification; } });
const Interest_1 = require("./Interest");
Object.defineProperty(exports, "Interest", { enumerable: true, get: function () { return Interest_1.Interest; } });
const PushSubscription_1 = require("./PushSubscription");
Object.defineProperty(exports, "PushSubscription", { enumerable: true, get: function () { return PushSubscription_1.PushSubscription; } });
const LmsCredential_1 = require("./LmsCredential");
Object.defineProperty(exports, "LmsCredential", { enumerable: true, get: function () { return LmsCredential_1.LmsCredential; } });
const CertificationType_1 = require("./CertificationType");
Object.defineProperty(exports, "CertificationType", { enumerable: true, get: function () { return CertificationType_1.CertificationType; } });
const Course_1 = require("./Course");
Object.defineProperty(exports, "Course", { enumerable: true, get: function () { return Course_1.Course; } });
const CourseModule_1 = require("./CourseModule");
Object.defineProperty(exports, "CourseModule", { enumerable: true, get: function () { return CourseModule_1.CourseModule; } });
const ExamConfig_1 = require("./ExamConfig");
Object.defineProperty(exports, "ExamConfig", { enumerable: true, get: function () { return ExamConfig_1.ExamConfig; } });
const ExamQuestion_1 = require("./ExamQuestion");
Object.defineProperty(exports, "ExamQuestion", { enumerable: true, get: function () { return ExamQuestion_1.ExamQuestion; } });
const PracticalCriterion_1 = require("./PracticalCriterion");
Object.defineProperty(exports, "PracticalCriterion", { enumerable: true, get: function () { return PracticalCriterion_1.PracticalCriterion; } });
const CertificationGap_1 = require("./CertificationGap");
Object.defineProperty(exports, "CertificationGap", { enumerable: true, get: function () { return CertificationGap_1.CertificationGap; } });
const CourseSubsidy_1 = require("./CourseSubsidy");
Object.defineProperty(exports, "CourseSubsidy", { enumerable: true, get: function () { return CourseSubsidy_1.CourseSubsidy; } });
const Enrollment_1 = require("./Enrollment");
Object.defineProperty(exports, "Enrollment", { enumerable: true, get: function () { return Enrollment_1.Enrollment; } });
const PracticalSession_1 = require("./PracticalSession");
Object.defineProperty(exports, "PracticalSession", { enumerable: true, get: function () { return PracticalSession_1.PracticalSession; } });
const PracticalBooking_1 = require("./PracticalBooking");
Object.defineProperty(exports, "PracticalBooking", { enumerable: true, get: function () { return PracticalBooking_1.PracticalBooking; } });
const ExamAttempt_1 = require("./ExamAttempt");
Object.defineProperty(exports, "ExamAttempt", { enumerable: true, get: function () { return ExamAttempt_1.ExamAttempt; } });
const Certificate_1 = require("./Certificate");
Object.defineProperty(exports, "Certificate", { enumerable: true, get: function () { return Certificate_1.Certificate; } });
const Ticket_1 = require("./Ticket");
Object.defineProperty(exports, "Ticket", { enumerable: true, get: function () { return Ticket_1.Ticket; } });
// User <-> Ticket
User_1.User.hasMany(Ticket_1.Ticket, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Ticket_1.Ticket.belongsTo(User_1.User, { foreignKey: 'userId' });
// Application <-> Ticket
Application_1.Application.hasMany(Ticket_1.Ticket, { foreignKey: 'applicationId', as: 'Tickets', onDelete: 'SET NULL' });
Ticket_1.Ticket.belongsTo(Application_1.Application, { foreignKey: 'applicationId' });
// User <-> Interest
User_1.User.hasMany(Interest_1.Interest, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Interest_1.Interest.belongsTo(User_1.User, { foreignKey: 'userId' });
// User <-> PushSubscription
User_1.User.hasMany(PushSubscription_1.PushSubscription, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
PushSubscription_1.PushSubscription.belongsTo(User_1.User, { foreignKey: 'userId' });
// Job Category <-> Job Listing
JobCategory_1.JobCategory.hasMany(JobListing_1.JobListing, { foreignKey: 'categoryId' });
JobListing_1.JobListing.belongsTo(JobCategory_1.JobCategory, { foreignKey: 'categoryId' });
// Job Category <-> Job Benefit
JobCategory_1.JobCategory.hasMany(JobBenefit_1.JobBenefit, { foreignKey: 'categoryId' });
JobBenefit_1.JobBenefit.belongsTo(JobCategory_1.JobCategory, { foreignKey: 'categoryId' });
// Job Category <-> Job Condition
JobCategory_1.JobCategory.hasMany(JobCondition_1.JobCondition, { foreignKey: 'categoryId' });
JobCondition_1.JobCondition.belongsTo(JobCategory_1.JobCategory, { foreignKey: 'categoryId' });
// Application <-> Job Stage
Application_1.Application.hasMany(JobStage_1.JobStage, { foreignKey: 'applicationId', as: 'JobStages', onDelete: 'CASCADE', hooks: true });
JobStage_1.JobStage.belongsTo(Application_1.Application, { foreignKey: 'applicationId' });
// JobListing <-> JobBenefit (M:N)
JobListing_1.JobListing.belongsToMany(JobBenefit_1.JobBenefit, { through: 'ListingBenefits', foreignKey: 'jobId', otherKey: 'benefitId' });
JobBenefit_1.JobBenefit.belongsToMany(JobListing_1.JobListing, { through: 'ListingBenefits', foreignKey: 'benefitId', otherKey: 'jobId' });
// JobListing <-> JobCondition (M:N)
JobListing_1.JobListing.belongsToMany(JobCondition_1.JobCondition, { through: 'ListingConditions', foreignKey: 'jobId', otherKey: 'conditionId' });
JobCondition_1.JobCondition.belongsToMany(JobListing_1.JobListing, { through: 'ListingConditions', foreignKey: 'conditionId', otherKey: 'jobId' });
// User <-> Application
User_1.User.hasMany(Application_1.Application, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Application_1.Application.belongsTo(User_1.User, { foreignKey: 'userId' });
// JobListing <-> Application
JobListing_1.JobListing.hasMany(Application_1.Application, { foreignKey: 'jobId' });
Application_1.Application.belongsTo(JobListing_1.JobListing, { foreignKey: 'jobId' });
// JobListing <-> JobStage (Template Stages)
// Application <-> Payment
Application_1.Application.hasMany(Payment_1.Payment, { foreignKey: 'applicationId', onDelete: 'CASCADE', hooks: true });
Payment_1.Payment.belongsTo(Application_1.Application, { foreignKey: 'applicationId' });
// JobStage <-> Payment
JobStage_1.JobStage.hasMany(Payment_1.Payment, { foreignKey: 'stageId', onDelete: 'CASCADE', hooks: true });
Payment_1.Payment.belongsTo(JobStage_1.JobStage, { foreignKey: 'stageId' });
// User <-> Notification
User_1.User.hasMany(Notification_1.Notification, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Notification_1.Notification.belongsTo(User_1.User, { foreignKey: 'userId' });
// Admin who verified payment
User_1.User.hasMany(Payment_1.Payment, { foreignKey: 'verifiedById', as: 'VerifiedPayments' });
Payment_1.Payment.belongsTo(User_1.User, { foreignKey: 'verifiedById', as: 'Verifier' });
// =======================
// LMS MODULE ASSOCIATIONS
// =======================
// LMS Credential <-> User
User_1.User.hasOne(LmsCredential_1.LmsCredential, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
LmsCredential_1.LmsCredential.belongsTo(User_1.User, { foreignKey: 'userId' });
// CertificationType <-> Course
CertificationType_1.CertificationType.hasMany(Course_1.Course, { foreignKey: 'certificationTypeId' });
Course_1.Course.belongsTo(CertificationType_1.CertificationType, { foreignKey: 'certificationTypeId' });
// Course <-> CourseModule
Course_1.Course.hasMany(CourseModule_1.CourseModule, { foreignKey: 'courseId', onDelete: 'CASCADE', hooks: true });
CourseModule_1.CourseModule.belongsTo(Course_1.Course, { foreignKey: 'courseId' });
// Course <-> ExamConfig
Course_1.Course.hasOne(ExamConfig_1.ExamConfig, { foreignKey: 'courseId', onDelete: 'CASCADE', hooks: true });
ExamConfig_1.ExamConfig.belongsTo(Course_1.Course, { foreignKey: 'courseId' });
// Course <-> ExamQuestion
Course_1.Course.hasMany(ExamQuestion_1.ExamQuestion, { foreignKey: 'courseId', onDelete: 'CASCADE', hooks: true });
ExamQuestion_1.ExamQuestion.belongsTo(Course_1.Course, { foreignKey: 'courseId' });
// Course <-> PracticalCriterion
Course_1.Course.hasMany(PracticalCriterion_1.PracticalCriterion, { foreignKey: 'courseId', onDelete: 'CASCADE', hooks: true });
PracticalCriterion_1.PracticalCriterion.belongsTo(Course_1.Course, { foreignKey: 'courseId' });
// User <-> CertificationGap
User_1.User.hasMany(CertificationGap_1.CertificationGap, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
CertificationGap_1.CertificationGap.belongsTo(User_1.User, { foreignKey: 'userId' });
CertificationType_1.CertificationType.hasMany(CertificationGap_1.CertificationGap, { foreignKey: 'certificationTypeId', onDelete: 'CASCADE', hooks: true });
CertificationGap_1.CertificationGap.belongsTo(CertificationType_1.CertificationType, { foreignKey: 'certificationTypeId' });
User_1.User.hasMany(CertificationGap_1.CertificationGap, { foreignKey: 'assignedByAdminId', as: 'AssignedGaps' });
CertificationGap_1.CertificationGap.belongsTo(User_1.User, { foreignKey: 'assignedByAdminId', as: 'Assigner' });
// CourseSubsidy
User_1.User.hasMany(CourseSubsidy_1.CourseSubsidy, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
CourseSubsidy_1.CourseSubsidy.belongsTo(User_1.User, { foreignKey: 'userId' });
Course_1.Course.hasMany(CourseSubsidy_1.CourseSubsidy, { foreignKey: 'courseId', onDelete: 'CASCADE', hooks: true });
CourseSubsidy_1.CourseSubsidy.belongsTo(Course_1.Course, { foreignKey: 'courseId' });
// Enrollment
User_1.User.hasMany(Enrollment_1.Enrollment, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Enrollment_1.Enrollment.belongsTo(User_1.User, { foreignKey: 'userId' });
Course_1.Course.hasMany(Enrollment_1.Enrollment, { foreignKey: 'courseId', onDelete: 'CASCADE', hooks: true });
Enrollment_1.Enrollment.belongsTo(Course_1.Course, { foreignKey: 'courseId' });
// PracticalSession
Course_1.Course.hasMany(PracticalSession_1.PracticalSession, { foreignKey: 'courseId', onDelete: 'CASCADE', hooks: true });
PracticalSession_1.PracticalSession.belongsTo(Course_1.Course, { foreignKey: 'courseId' });
User_1.User.hasMany(PracticalSession_1.PracticalSession, { foreignKey: 'instructorId' });
PracticalSession_1.PracticalSession.belongsTo(User_1.User, { foreignKey: 'instructorId' });
// PracticalBooking
PracticalSession_1.PracticalSession.hasMany(PracticalBooking_1.PracticalBooking, { foreignKey: 'sessionId', onDelete: 'CASCADE', hooks: true });
PracticalBooking_1.PracticalBooking.belongsTo(PracticalSession_1.PracticalSession, { foreignKey: 'sessionId' });
User_1.User.hasMany(PracticalBooking_1.PracticalBooking, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
PracticalBooking_1.PracticalBooking.belongsTo(User_1.User, { foreignKey: 'userId' });
// ExamAttempt
User_1.User.hasMany(ExamAttempt_1.ExamAttempt, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
ExamAttempt_1.ExamAttempt.belongsTo(User_1.User, { foreignKey: 'userId' });
Course_1.Course.hasMany(ExamAttempt_1.ExamAttempt, { foreignKey: 'courseId', onDelete: 'CASCADE', hooks: true });
ExamAttempt_1.ExamAttempt.belongsTo(Course_1.Course, { foreignKey: 'courseId' });
// Certificate
User_1.User.hasMany(Certificate_1.Certificate, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Certificate_1.Certificate.belongsTo(User_1.User, { foreignKey: 'userId' });
CertificationType_1.CertificationType.hasMany(Certificate_1.Certificate, { foreignKey: 'certificationTypeId', onDelete: 'CASCADE', hooks: true });
Certificate_1.Certificate.belongsTo(CertificationType_1.CertificationType, { foreignKey: 'certificationTypeId' });
