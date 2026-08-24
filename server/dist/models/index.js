"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contract = exports.Nomination = exports.PsychometricAttempt = exports.TicketCatalog = exports.Ticket = exports.Certificate = exports.ExamAttempt = exports.Enrollment = exports.ExamQuestion = exports.ExamConfig = exports.CourseModule = exports.Course = exports.CertificationType = exports.LmsCredential = exports.Interest = exports.Notification = exports.Receipt = exports.Invoice = exports.Application = exports.JobStage = exports.JobListing = exports.JobCategory = exports.BankAccount = exports.User = exports.sequelize = void 0;
const database_1 = require("../config/database");
Object.defineProperty(exports, "sequelize", { enumerable: true, get: function () { return database_1.sequelize; } });
const User_1 = require("./User");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return User_1.User; } });
const BankAccount_1 = require("./BankAccount");
Object.defineProperty(exports, "BankAccount", { enumerable: true, get: function () { return BankAccount_1.BankAccount; } });
const JobCategory_1 = require("./JobCategory");
Object.defineProperty(exports, "JobCategory", { enumerable: true, get: function () { return JobCategory_1.JobCategory; } });
const JobListing_1 = require("./JobListing");
Object.defineProperty(exports, "JobListing", { enumerable: true, get: function () { return JobListing_1.JobListing; } });
const JobStage_1 = require("./JobStage");
Object.defineProperty(exports, "JobStage", { enumerable: true, get: function () { return JobStage_1.JobStage; } });
const Application_1 = require("./Application");
Object.defineProperty(exports, "Application", { enumerable: true, get: function () { return Application_1.Application; } });
const Invoice_1 = require("./Invoice");
Object.defineProperty(exports, "Invoice", { enumerable: true, get: function () { return Invoice_1.Invoice; } });
const Receipt_1 = require("./Receipt");
Object.defineProperty(exports, "Receipt", { enumerable: true, get: function () { return Receipt_1.Receipt; } });
const Notification_1 = require("./Notification");
Object.defineProperty(exports, "Notification", { enumerable: true, get: function () { return Notification_1.Notification; } });
const Interest_1 = require("./Interest");
Object.defineProperty(exports, "Interest", { enumerable: true, get: function () { return Interest_1.Interest; } });
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
const Enrollment_1 = require("./Enrollment");
Object.defineProperty(exports, "Enrollment", { enumerable: true, get: function () { return Enrollment_1.Enrollment; } });
const ExamAttempt_1 = require("./ExamAttempt");
Object.defineProperty(exports, "ExamAttempt", { enumerable: true, get: function () { return ExamAttempt_1.ExamAttempt; } });
const Certificate_1 = require("./Certificate");
Object.defineProperty(exports, "Certificate", { enumerable: true, get: function () { return Certificate_1.Certificate; } });
const Ticket_1 = require("./Ticket");
Object.defineProperty(exports, "Ticket", { enumerable: true, get: function () { return Ticket_1.Ticket; } });
const TicketCatalog_1 = require("./TicketCatalog");
Object.defineProperty(exports, "TicketCatalog", { enumerable: true, get: function () { return TicketCatalog_1.TicketCatalog; } });
const PsychometricAttempt_1 = require("./PsychometricAttempt");
Object.defineProperty(exports, "PsychometricAttempt", { enumerable: true, get: function () { return PsychometricAttempt_1.PsychometricAttempt; } });
const Nomination_1 = require("./Nomination");
Object.defineProperty(exports, "Nomination", { enumerable: true, get: function () { return Nomination_1.Nomination; } });
const Contract_1 = require("./Contract");
Object.defineProperty(exports, "Contract", { enumerable: true, get: function () { return Contract_1.Contract; } });
// User <-> Ticket
User_1.User.hasMany(Ticket_1.Ticket, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Ticket_1.Ticket.belongsTo(User_1.User, { foreignKey: 'userId' });
// Application <-> Ticket
Application_1.Application.hasMany(Ticket_1.Ticket, { foreignKey: 'applicationId', as: 'Tickets', onDelete: 'SET NULL' });
Ticket_1.Ticket.belongsTo(Application_1.Application, { foreignKey: 'applicationId' });
// User <-> Interest
User_1.User.hasMany(Interest_1.Interest, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Interest_1.Interest.belongsTo(User_1.User, { foreignKey: 'userId' });
// Job Category <-> Job Listing
JobCategory_1.JobCategory.hasMany(JobListing_1.JobListing, { foreignKey: 'categoryId' });
JobListing_1.JobListing.belongsTo(JobCategory_1.JobCategory, { foreignKey: 'categoryId' });
// Application <-> Job Stage
Application_1.Application.hasMany(JobStage_1.JobStage, { foreignKey: 'applicationId', as: 'JobStages', onDelete: 'CASCADE', hooks: true });
JobStage_1.JobStage.belongsTo(Application_1.Application, { foreignKey: 'applicationId' });
// Application <-> Nomination
Application_1.Application.hasMany(Nomination_1.Nomination, { foreignKey: 'applicationId', as: 'Nominations', onDelete: 'CASCADE', hooks: true });
Nomination_1.Nomination.belongsTo(Application_1.Application, { foreignKey: 'applicationId' });
// Application <-> Contract
Application_1.Application.hasMany(Contract_1.Contract, { foreignKey: 'applicationId', as: 'Contracts', onDelete: 'CASCADE', hooks: true });
Contract_1.Contract.belongsTo(Application_1.Application, { foreignKey: 'applicationId' });
// User <-> Contract
User_1.User.hasMany(Contract_1.Contract, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Contract_1.Contract.belongsTo(User_1.User, { foreignKey: 'userId' });
// User <-> Application
User_1.User.hasMany(Application_1.Application, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Application_1.Application.belongsTo(User_1.User, { foreignKey: 'userId' });
// JobListing <-> Application
JobListing_1.JobListing.hasMany(Application_1.Application, { foreignKey: 'jobId' });
Application_1.Application.belongsTo(JobListing_1.JobListing, { foreignKey: 'jobId' });
// JobListing <-> TicketCatalog (M:M)
JobListing_1.JobListing.belongsToMany(TicketCatalog_1.TicketCatalog, { through: 'job_ticket_requirements', foreignKey: 'jobId', otherKey: 'ticketCatalogId', as: 'RequiredTickets' });
TicketCatalog_1.TicketCatalog.belongsToMany(JobListing_1.JobListing, { through: 'job_ticket_requirements', foreignKey: 'ticketCatalogId', otherKey: 'jobId', as: 'Jobs' });
// JobListing <-> JobStage (Template Stages)
// Invoice <-> Receipt
Invoice_1.Invoice.hasOne(Receipt_1.Receipt, { foreignKey: 'invoiceId', onDelete: 'CASCADE', hooks: true });
Receipt_1.Receipt.belongsTo(Invoice_1.Invoice, { foreignKey: 'invoiceId' });
// User <-> Invoice
User_1.User.hasMany(Invoice_1.Invoice, { foreignKey: 'applicantId', as: 'invoices', onDelete: 'CASCADE', hooks: true });
Invoice_1.Invoice.belongsTo(User_1.User, { foreignKey: 'applicantId', as: 'applicant' });
// User <-> Notification
User_1.User.hasMany(Notification_1.Notification, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Notification_1.Notification.belongsTo(User_1.User, { foreignKey: 'userId' });
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
// Enrollment
User_1.User.hasMany(Enrollment_1.Enrollment, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Enrollment_1.Enrollment.belongsTo(User_1.User, { foreignKey: 'userId' });
Course_1.Course.hasMany(Enrollment_1.Enrollment, { foreignKey: 'courseId', onDelete: 'CASCADE', hooks: true });
Enrollment_1.Enrollment.belongsTo(Course_1.Course, { foreignKey: 'courseId' });
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
// PsychometricAttempt
User_1.User.hasMany(PsychometricAttempt_1.PsychometricAttempt, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
PsychometricAttempt_1.PsychometricAttempt.belongsTo(User_1.User, { foreignKey: 'userId' });
