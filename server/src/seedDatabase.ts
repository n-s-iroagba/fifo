import { sequelize, User, BankAccount, CryptoWallet, JobCategory, JobListing, JobBenefit, JobCondition } from './models';
import { CONSTANTS } from './constants';
import bcrypt from 'bcrypt';
import { fifoJobs } from './data/fifoJobs';

export async function seedDatabase() {
    console.log('Starting idempotent seeding process...');

    // 1. Initialize Tables (Safe Sync)
    await sequelize.sync({ force: true });




    // 4. Seed Categories
    const categoryMap: Record<string, any> = {};
    const sectors = [
        { name: 'Mining Operations', description: 'Technical and physical operations in mine sites.' },
        { name: 'Mobile Plant Operations', description: 'Operation of heavy machinery and earthmoving equipment.' },
        { name: 'Drilling & Blasting', description: 'Specialized drilling, exploration, and blast hole operations.' },
        { name: 'Processing / Fixed Plant / Plant Operations', description: 'Mineral processing and refinery operations.' },
        { name: 'Shutdowns / Maintenance', description: 'Critical maintenance and project-based shutdown works.' },
        { name: 'Mechanical Trades', description: 'Diesel fitting, mechanical fitting, and heavy equipment maintenance.' },
        { name: 'Electrical / Instrumentation', description: 'HV electrical, instrumentation, and control systems.' },
        { name: 'Construction & Civil', description: 'Industrial construction and civil engineering projects.' },
        { name: 'Oil & Gas / Energy / Power', description: 'Power generation and hydrocarbons extraction.' },
        { name: 'HSE / Safety / Quality', description: 'Health, Safety, and Environment management.' },
        { name: 'Engineering / Technical', description: 'Engineering design, planning, and technical oversight.' },
        { name: 'Geology / Exploration', description: 'Mineral exploration and geological mapping.' },
        { name: 'Laboratory / Sampling', description: 'Assay operations and mineral analysis.' },
        { name: 'Transport / Logistics / Heavy Haulage', description: 'Heavy vehicle operation and site logistics.' },
        { name: 'Warehousing / Stores / Supply', description: 'Inventory management and supply chain operations.' },
        { name: 'Camp / Village / Utilities', description: 'Village management and site lifestyle services.' },
        { name: 'Catering / Hospitality / Housekeeping', description: 'Catering and camp cleaning services.' },
        { name: 'Medical / Emergency Response', description: 'Remote medicine and site emergency services.' },
        { name: 'Administration / Site Administration / Payroll / Document Control', description: 'Site support and business administration.' },
        { name: 'HR / Recruitment / Training', description: 'Personnel management and compliance training.' },
        { name: 'IT / Communications', description: 'Network infrastructure and site IT support.' },
        { name: 'Security', description: 'Site access control and asset protection.' },
        { name: 'Supervisory / Leadership / Management', description: 'Site leadership and departmental management.' },
        { name: 'Entry-Level / Utility / Traineeship / Trades Assistant', description: 'Entry pathways into the resources sector.' }
    ];

    for (const sector of sectors) {
        const [cat] = await JobCategory.findOrCreate({
            where: { name: sector.name },
            defaults: sector
        });
        categoryMap[sector.name] = cat;
    }


    console.log(`Checking/Importing ${fifoJobs.length} FIFO jobs...`);

    for (const jobData of fifoJobs) {
        const category = categoryMap[jobData.category];
        if (!category) {
            console.warn(`Category ${jobData.category} not found for job ${jobData.title}. Skipping.`);
            continue;
        }

        const [job] = await JobListing.findOrCreate({
            where: {
                title: jobData.title,
                categoryId: category.id
            },
            defaults: {
                description: `Join Australian Resource Group as a ${jobData.title}. This role offers a competitive salary of ${jobData.salary} and a stable shift roster within the ${jobData.category} sector.`,
                location: 'Remote WA/QLD (FIFO)',
                employmentType: 'Full-Time (FIFO)',
                requirements: jobData.requirements.join(', '),
                company: 'Australian Resource Group',
                salary: jobData.salary,
                visaSponsorship: false,
                isActive: true,
                stages: []
            }
        });

        // 6. Link Benefits
        for (const benefitDesc of jobData.benefits) {
            const [benefit] = await JobBenefit.findOrCreate({
                where: { description: benefitDesc },
                defaults: {
                    benefitType: 'Employment Benefit',
                    description: benefitDesc,
                    categoryId: category.id
                }
            });
            await (job as any).addJobBenefit(benefit);
        }

        // 7. Link Conditions
        for (const condDesc of jobData.requirements) {
            const [condition] = await JobCondition.findOrCreate({
                where: { description: condDesc },
                defaults: {
                    name: 'Site Requirement',
                    description: condDesc,
                    categoryId: category.id
                }
            });
            await (job as any).addJobCondition(condition);
        }
    }

    console.log('Idempotent seeding completed successfully!');
}

if (require.main === module) {
    seedDatabase().catch(err => {
        console.error('Seeding failed:', err);
        process.exit(1);
    });
}
