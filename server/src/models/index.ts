import { sequelize } from '../config/database';
import { User } from './User';
import { BankAccount } from './BankAccount';
import { JobCategory } from './JobCategory';
import { JobListing } from './JobListing';
import { JobStage } from './JobStage';
import { Application } from './Application';
import { Invoice } from './Invoice';
import { Receipt } from './Receipt';
import { Notification } from './Notification';
import { Interest } from './Interest';
import { LmsCredential } from './LmsCredential';
import { CertificationType } from './CertificationType';
import { Course } from './Course';
import { CourseModule } from './CourseModule';
import { ExamConfig } from './ExamConfig';
import { ExamQuestion } from './ExamQuestion';


import { Enrollment } from './Enrollment';
import { ExamAttempt } from './ExamAttempt';
import { Certificate } from './Certificate';
import { Ticket } from './Ticket';
import { TicketCatalog } from './TicketCatalog';
import { PrefillStage } from './PrefillStage';
import { PsychometricAttempt } from './PsychometricAttempt';
import { Nomination } from './Nomination';
import { Contract } from './Contract';

// User <-> Ticket
User.hasMany(Ticket, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Ticket.belongsTo(User, { foreignKey: 'userId' });

// Application <-> Ticket
Application.hasMany(Ticket, { foreignKey: 'applicationId', as: 'Tickets', onDelete: 'SET NULL' });
Ticket.belongsTo(Application, { foreignKey: 'applicationId' });

// User <-> Interest
User.hasMany(Interest, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Interest.belongsTo(User, { foreignKey: 'userId' });

// PrefillStage <-> User
PrefillStage.hasMany(User, { foreignKey: 'adminStageId', as: 'Users' });
User.belongsTo(PrefillStage, { foreignKey: 'adminStageId', as: 'AdminStage' });

// PrefillStage <-> JobStage
PrefillStage.hasMany(JobStage, { foreignKey: 'prefillStageId', as: 'JobStages' });
JobStage.belongsTo(PrefillStage, { foreignKey: 'prefillStageId', as: 'PrefillStage' });



// Job Category <-> Job Listing
JobCategory.hasMany(JobListing, { foreignKey: 'categoryId' });
JobListing.belongsTo(JobCategory, { foreignKey: 'categoryId' });

// Application <-> Job Stage
Application.hasMany(JobStage, { foreignKey: 'applicationId', as: 'JobStages', onDelete: 'CASCADE', hooks: true });
JobStage.belongsTo(Application, { foreignKey: 'applicationId' });

// Application <-> Nomination
Application.hasMany(Nomination, { foreignKey: 'applicationId', as: 'Nominations', onDelete: 'CASCADE', hooks: true });
Nomination.belongsTo(Application, { foreignKey: 'applicationId' });

// Application <-> Contract
Application.hasMany(Contract, { foreignKey: 'applicationId', as: 'Contracts', onDelete: 'CASCADE', hooks: true });
Contract.belongsTo(Application, { foreignKey: 'applicationId' });
// User <-> Contract
User.hasMany(Contract, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Contract.belongsTo(User, { foreignKey: 'userId' });

// User <-> Application
User.hasMany(Application, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Application.belongsTo(User, { foreignKey: 'userId' });

// JobListing <-> Application
JobListing.hasMany(Application, { foreignKey: 'jobId' });
Application.belongsTo(JobListing, { foreignKey: 'jobId' });

// JobListing <-> TicketCatalog (M:M)
JobListing.belongsToMany(TicketCatalog, { through: 'job_ticket_requirements', foreignKey: 'jobId', otherKey: 'ticketCatalogId', as: 'RequiredTickets' });
TicketCatalog.belongsToMany(JobListing, { through: 'job_ticket_requirements', foreignKey: 'ticketCatalogId', otherKey: 'jobId', as: 'Jobs' });

// JobListing <-> JobStage (Template Stages)

// Invoice <-> Receipt
Invoice.hasOne(Receipt, { foreignKey: 'invoiceId', onDelete: 'CASCADE', hooks: true });
Receipt.belongsTo(Invoice, { foreignKey: 'invoiceId' });

// User <-> Invoice
User.hasMany(Invoice, { foreignKey: 'applicantId', as: 'invoices', onDelete: 'CASCADE', hooks: true });
Invoice.belongsTo(User, { foreignKey: 'applicantId', as: 'applicant' });
// User <-> Notification
User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Notification.belongsTo(User, { foreignKey: 'userId' });



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






// Enrollment
User.hasMany(Enrollment, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Enrollment.belongsTo(User, { foreignKey: 'userId' });
Course.hasMany(Enrollment, { foreignKey: 'courseId', onDelete: 'CASCADE', hooks: true });
Enrollment.belongsTo(Course, { foreignKey: 'courseId' });



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

// PsychometricAttempt
User.hasMany(PsychometricAttempt, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
PsychometricAttempt.belongsTo(User, { foreignKey: 'userId' });

export {
    sequelize,
    User,
    BankAccount,
    JobCategory,
    JobListing,
    JobStage,
    Application,
    Invoice,
    Receipt,
    Notification,
    Interest,
    LmsCredential,
    CertificationType,
    Course,
    CourseModule,
    ExamConfig,
    ExamQuestion,


    Enrollment,
    ExamAttempt,
    Certificate,
    Ticket,
    TicketCatalog,
    PrefillStage,
    PsychometricAttempt,
    Nomination,
    Contract
};
