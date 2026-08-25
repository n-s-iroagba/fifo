"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runLmsDeduplication = runLmsDeduplication;
const database_1 = require("../config/database");
/**
 * Migration: LMS Deduplication
 * Removes duplicate records across certification_types, courses, course_modules, exam_questions, and ticket_catalogs.
 */
async function runLmsDeduplication() {
    console.log('[Migration] Deduplicating LMS tables...');
    try {
        const legacyPlainNames = [
            'EEHA Certification',
            'Standard 11 Mining Induction',
            'White Card WA',
            'Working at Heights',
            'Confined Space Entry',
            'Gas Test Atmospheres',
            'Provide First Aid',
            'National Police Clearance',
            'Australian Drivers Licence (Class C)',
            'Certificate III in Commercial Cookery',
            'Food Safety Supervisor',
            'Responsible Service of Alcohol (RSA)',
            'Forklift Licence (LF)'
        ];
        for (const plainName of legacyPlainNames) {
            // Delete un-coded ticket catalog entry if a coded counterpart exists
            await database_1.sequelize.query(`
                DELETE FROM ticket_catalogs
                WHERE name = :plainName
                AND EXISTS (
                    SELECT 1 FROM (SELECT * FROM ticket_catalogs) tc2
                    WHERE tc2.name LIKE CONCAT('%', :plainName) AND tc2.name != :plainName
                );
            `, { replacements: { plainName } });
            // Delete un-coded certification_types if a coded counterpart exists
            await database_1.sequelize.query(`
                DELETE FROM certification_types
                WHERE name = :plainName
                AND EXISTS (
                    SELECT 1 FROM (SELECT * FROM certification_types) ct2
                    WHERE ct2.name LIKE CONCAT('%', :plainName) AND ct2.name != :plainName
                );
            `, { replacements: { plainName } });
        }
        // Deduplicate certification_types by name
        await database_1.sequelize.query(`
            DELETE ct FROM certification_types ct
            INNER JOIN certification_types ct2
            ON ct.name = ct2.name AND ct.id > ct2.id;
        `);
        // Deduplicate courses by title
        await database_1.sequelize.query(`
            DELETE c FROM courses c
            INNER JOIN courses c2
            ON c.title = c2.title AND c.id > c2.id;
        `);
        // Deduplicate course_modules by course_id + title
        await database_1.sequelize.query(`
            DELETE cm FROM course_modules cm
            INNER JOIN course_modules cm2
            ON cm.course_id = cm2.course_id AND cm.title = cm2.title AND cm.id > cm2.id;
        `);
        // Deduplicate exam_questions by course_id + question_text
        await database_1.sequelize.query(`
            DELETE eq FROM exam_questions eq
            INNER JOIN exam_questions eq2
            ON eq.course_id = eq2.course_id AND eq.question_text = eq2.question_text AND eq.id > eq2.id;
        `);
        // Deduplicate ticket_catalogs by name
        await database_1.sequelize.query(`
            DELETE tc FROM ticket_catalogs tc
            INNER JOIN ticket_catalogs tc2
            ON tc.name = tc2.name AND tc.id > tc2.id;
        `);
        console.log('[Migration] LMS deduplication completed successfully.');
    }
    catch (e) {
        console.error('[Migration] Deduplication error (non-fatal):', e.message);
    }
}
