"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
async function run() {
    try {
        await models_1.sequelize.query('ALTER TABLE job_listings ADD COLUMN benefits TEXT DEFAULT NULL;');
        console.log("Added benefits column to job_listings");
    }
    catch (e) {
        console.log("Error adding benefits:", e.message);
    }
    try {
        const invoices = await models_1.Invoice.findAll({
            include: [{ association: 'applicant', attributes: ['id', 'fullName', 'email', 'candidateNumber'] }],
        });
        console.log("Successfully fetched invoices");
    }
    catch (e) {
        console.log("Error fetching invoices:", e.message);
    }
    process.exit(0);
}
run();
