"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("./models");
const constants_1 = require("./constants");
const bcrypt_1 = __importDefault(require("bcrypt"));
async function seed() {
    await models_1.sequelize.sync({ force: true });
    console.log('Database synced. Seeding data...');
    const passwordHash = await bcrypt_1.default.hash('AdminPass1!', 12);
    // Seed Admin User
    const admin = await models_1.User.create({
        fullName: 'System Admin',
        email: 'admin@jobagency.com',
        passwordHash,
        role: constants_1.CONSTANTS.ROLES.ADMIN,
        isVerified: true,
    });
    // Seed Applicant Users (Simulating capacity sample)
    const applicants = [];
    for (let i = 1; i <= 5; i++) {
        applicants.push(await models_1.User.create({
            fullName: `Applicant ${i}`,
            email: `applicant${i}@jobagency.com`,
            passwordHash: await bcrypt_1.default.hash('Password1!', 12),
            role: constants_1.CONSTANTS.ROLES.APPLICANT,
            isVerified: true,
        }));
    }
    // Seed Bank Accounts
    await models_1.BankAccount.create({
        bankName: 'Global Transfer Bank',
        accountNumber: '0000123456',
        accountType: constants_1.CONSTANTS.BANK_ACCOUNT_TYPES.OPEN_BENEFICIARY,
        routingCode: 'RT001',
    });
    await models_1.BankAccount.create({
        bankName: 'High Value Capital',
        accountNumber: '9999123456',
        accountType: constants_1.CONSTANTS.BANK_ACCOUNT_TYPES.NORMAL,
        routingCode: 'HV002',
    });
    // Seed Crypto Wallet
    await models_1.CryptoWallet.create({
        displayLabel: 'Primary Bitcoin Wallet',
        currencyName: constants_1.CONSTANTS.CRYPTO_TYPES.BTC,
        networkType: constants_1.CONSTANTS.CRYPTO_NETWORKS.BEP20,
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        memoTag: '',
        isActive: true,
    });
    // Seed Job Categories
    const catTech = await models_1.JobCategory.create({ name: 'Technology', description: 'Tech & Engineering roles' });
    const catOps = await models_1.JobCategory.create({ name: 'Operations', description: 'Business Ops & Logistics' });
    // Seed Job Listings
    const job1 = await models_1.JobListing.create({
        title: 'Senior Frontend Node Engineer',
        description: 'Lead the frontend architecture using Next.js and TypeScript.',
        location: 'Remote',
        employmentType: 'Full-Time',
        requirements: '5+ years experience, expert in React and Node',
        categoryId: catTech.id,
    });
    // Seed Benefits and Conditions
    const benHealth = await models_1.JobBenefit.create({ benefitType: 'Health Insurance', description: 'Full premiums covered' });
    const condVisa = await models_1.JobCondition.create({ name: 'Visa Status', description: 'Must have working rights in required timezone.' });
    // Add M:N relationships
    await job1.addJobBenefit(benHealth);
    await job1.addJobCondition(condVisa);
    // Seed Application Stages
    await models_1.JobStage.create({
        jobId: job1.id,
        name: 'Document Upload & Review',
        description: 'Please upload your CV and cover letter.',
        orderPosition: 1,
        requiresPayment: false,
    });
    await models_1.JobStage.create({
        jobId: job1.id,
        name: 'Background Verification Payment',
        description: 'Payment required for third-party background screening.',
        orderPosition: 2,
        requiresPayment: true,
        amount: 150.00,
        currency: 'USD',
        instructions: 'Please transfer exactly $150 USD and upload the receipt here.',
    });
    console.log('Seeding completed successfully!');
}
seed().catch(err => {
    console.error('Failed to seed database:', err);
    process.exit(1);
});
