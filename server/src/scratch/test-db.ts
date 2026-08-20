import { sequelize, JobListing, Invoice, User } from '../models';

async function run() {
    try {
        await sequelize.query('ALTER TABLE job_listings ADD COLUMN benefits TEXT DEFAULT NULL;');
        console.log("Added benefits column to job_listings");
    } catch(e: any) {
        console.log("Error adding benefits:", e.message);
    }
    
    try {
        const invoices = await Invoice.findAll({
            include: [{ association: 'applicant', attributes: ['id', 'fullName', 'email', 'candidateNumber'] }],
        });
        console.log("Successfully fetched invoices");
    } catch(e: any) {
        console.log("Error fetching invoices:", e.message);
    }
    
    process.exit(0);
}
run();
