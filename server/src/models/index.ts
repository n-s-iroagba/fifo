import { sequelize } from '../config/database';
import { User } from './User';
import { BankAccount } from './BankAccount';
import { CryptoWallet } from './CryptoWallet';
import { JobCategory } from './JobCategory';
import { JobListing } from './JobListing';
import { JobBenefit } from './JobBenefit';
import { JobCondition } from './JobCondition';
import { JobStage } from './JobStage';
import { Application } from './Application';
import { Payment } from './Payment';
import { Notification } from './Notification';
import { Interest } from './Interest';
import { PushSubscription } from './PushSubscription';
import { LmsCredential } from './LmsCredential';
import { CertificationType } from './CertificationType';
import { Course } from './Course';
import { CourseModule } from './CourseModule';
import { ExamConfig } from './ExamConfig';
import { ExamQuestion } from './ExamQuestion';
import { PracticalCriterion } from './PracticalCriterion';
import { CertificationGap } from './CertificationGap';
import { CourseSubsidy } from './CourseSubsidy';
import { Enrollment } from './Enrollment';
import { PracticalSession } from './PracticalSession';
import { PracticalBooking } from './PracticalBooking';
import { ExamAttempt } from './ExamAttempt';
import { Certificate } from './Certificate';
import { Ticket } from './Ticket';

// User <-> Ticket
User.hasMany(Ticket, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Ticket.belongsTo(User, { foreignKey: 'userId' });

// Application <-> Ticket
Application.hasMany(Ticket, { foreignKey: 'applicationId', as: 'Tickets', onDelete: 'SET NULL' });
Ticket.belongsTo(Application, { foreignKey: 'applicationId' });

// User <-> Interest
User.hasMany(Interest, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Interest.belongsTo(User, { foreignKey: 'userId' });

// User <-> PushSubscription
User.hasMany(PushSubscription, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
PushSubscription.belongsTo(User, { foreignKey: 'userId' });

// Job Category <-> Job Listing
JobCategory.hasMany(JobListing, { foreignKey: 'categoryId' });
JobListing.belongsTo(JobCategory, { foreignKey: 'categoryId' });

// Job Category <-> Job Benefit
JobCategory.hasMany(JobBenefit, { foreignKey: 'categoryId' });
JobBenefit.belongsTo(JobCategory, { foreignKey: 'categoryId' });

// Job Category <-> Job Condition
JobCategory.hasMany(JobCondition, { foreignKey: 'categoryId' });
JobCondition.belongsTo(JobCategory, { foreignKey: 'categoryId' });

// Application <-> Job Stage
Application.hasMany(JobStage, { foreignKey: 'applicationId', as: 'JobStages', onDelete: 'CASCADE', hooks: true });
JobStage.belongsTo(Application, { foreignKey: 'applicationId' });

// JobListing <-> JobBenefit (M:N)
JobListing.belongsToMany(JobBenefit, { through: 'ListingBenefits', foreignKey: 'jobId', otherKey: 'benefitId' });
JobBenefit.belongsToMany(JobListing, { through: 'ListingBenefits', foreignKey: 'benefitId', otherKey: 'jobId' });

// JobListing <-> JobCondition (M:N)
JobListing.belongsToMany(JobCondition, { through: 'ListingConditions', foreignKey: 'jobId', otherKey: 'conditionId' });
JobCondition.belongsToMany(JobListing, { through: 'ListingConditions', foreignKey: 'conditionId', otherKey: 'jobId' });

// User <-> Application
User.hasMany(Application, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Application.belongsTo(User, { foreignKey: 'userId' });

// JobListing <-> Application
JobListing.hasMany(Application, { foreignKey: 'jobId' });
Application.belongsTo(JobListing, { foreignKey: 'jobId' });

// JobListing <-> JobStage (Template Stages)

// Application <-> Payment
Application.hasMany(Payment, { foreignKey: 'applicationId', onDelete: 'CASCADE', hooks: true });
Payment.belongsTo(Application, { foreignKey: 'applicationId' });

// JobStage <-> Payment
JobStage.hasMany(Payment, { foreignKey: 'stageId', onDelete: 'CASCADE', hooks: true });
Payment.belongsTo(JobStage, { foreignKey: 'stageId' });
// User <-> Notification
User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Notification.belongsTo(User, { foreignKey: 'userId' });

// Admin who verified payment
User.hasMany(Payment, { foreignKey: 'verifiedById', as: 'VerifiedPayments' });
Payment.belongsTo(User, { foreignKey: 'verifiedById', as: 'Verifier' });

// =======================
// LMS MODULE ASSOCIATIONS
// =======================

// LMS Credential <-> User
User.hasOne(LmsCredential, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
LmsCredential.belongsTo(User, { foreignKey: 'userId' });

// CertificationType <-> Course
CertificationType.hasMany(Course, { foreignKey: 'certificationTypeId' });
Course.belongsTo(CertificationType, { foreignKey: 'certificationTypeId' });

// Course <-> CourseModule
Course.hasMany(CourseModule, { foreignKey: 'courseId', onDelete: 'CASCADE', hooks: true });
CourseModule.belongsTo(Course, { foreignKey: 'courseId' });

// Course <-> ExamConfig
Course.hasOne(ExamConfig, { foreignKey: 'courseId', onDelete: 'CASCADE', hooks: true });
ExamConfig.belongsTo(Course, { foreignKey: 'courseId' });

// Course <-> ExamQuestion
Course.hasMany(ExamQuestion, { foreignKey: 'courseId', onDelete: 'CASCADE', hooks: true });
ExamQuestion.belongsTo(Course, { foreignKey: 'courseId' });

// Course <-> PracticalCriterion
Course.hasMany(PracticalCriterion, { foreignKey: 'courseId', onDelete: 'CASCADE', hooks: true });
PracticalCriterion.belongsTo(Course, { foreignKey: 'courseId' });

// User <-> CertificationGap
User.hasMany(CertificationGap, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
CertificationGap.belongsTo(User, { foreignKey: 'userId' });
CertificationType.hasMany(CertificationGap, { foreignKey: 'certificationTypeId', onDelete: 'CASCADE', hooks: true });
CertificationGap.belongsTo(CertificationType, { foreignKey: 'certificationTypeId' });
User.hasMany(CertificationGap, { foreignKey: 'assignedByAdminId', as: 'AssignedGaps' });
CertificationGap.belongsTo(User, { foreignKey: 'assignedByAdminId', as: 'Assigner' });

// CourseSubsidy
User.hasMany(CourseSubsidy, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
CourseSubsidy.belongsTo(User, { foreignKey: 'userId' });
Course.hasMany(CourseSubsidy, { foreignKey: 'courseId', onDelete: 'CASCADE', hooks: true });
CourseSubsidy.belongsTo(Course, { foreignKey: 'courseId' });

// Enrollment
User.hasMany(Enrollment, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Enrollment.belongsTo(User, { foreignKey: 'userId' });
Course.hasMany(Enrollment, { foreignKey: 'courseId', onDelete: 'CASCADE', hooks: true });
Enrollment.belongsTo(Course, { foreignKey: 'courseId' });

// PracticalSession
Course.hasMany(PracticalSession, { foreignKey: 'courseId', onDelete: 'CASCADE', hooks: true });
PracticalSession.belongsTo(Course, { foreignKey: 'courseId' });
User.hasMany(PracticalSession, { foreignKey: 'instructorId' });
PracticalSession.belongsTo(User, { foreignKey: 'instructorId' });

// PracticalBooking
PracticalSession.hasMany(PracticalBooking, { foreignKey: 'sessionId', onDelete: 'CASCADE', hooks: true });
PracticalBooking.belongsTo(PracticalSession, { foreignKey: 'sessionId' });
User.hasMany(PracticalBooking, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
PracticalBooking.belongsTo(User, { foreignKey: 'userId' });

// ExamAttempt
User.hasMany(ExamAttempt, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
ExamAttempt.belongsTo(User, { foreignKey: 'userId' });
Course.hasMany(ExamAttempt, { foreignKey: 'courseId', onDelete: 'CASCADE', hooks: true });
ExamAttempt.belongsTo(Course, { foreignKey: 'courseId' });

// Certificate
User.hasMany(Certificate, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Certificate.belongsTo(User, { foreignKey: 'userId' });
CertificationType.hasMany(Certificate, { foreignKey: 'certificationTypeId', onDelete: 'CASCADE', hooks: true });
Certificate.belongsTo(CertificationType, { foreignKey: 'certificationTypeId' });

export {
    sequelize,
    User,
    BankAccount,
    CryptoWallet,
    JobCategory,
    JobListing,
    JobBenefit,
    JobCondition,
    JobStage,
    Application,
    Payment,
    Notification,
    Interest,
    PushSubscription,
    LmsCredential,
    CertificationType,
    Course,
    CourseModule,
    ExamConfig,
    ExamQuestion,
    PracticalCriterion,
    CertificationGap,
    CourseSubsidy,
    Enrollment,
    PracticalSession,
    PracticalBooking,
    ExamAttempt,
    Certificate,
    Ticket
};
