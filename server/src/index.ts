import 'dotenv/config';
import app from './app';
import { connectDB, sequelize } from './config/database';
import { logger } from './utils/logger';

// Initializes Associations Mapping
import './models';
import registerCrons from './scripts/register-qstash-crons';








const PORT = process.env.PORT || 5000;

const startServer = async () => {

    try {
        await connectDB();
        app.listen(PORT, async () => {
            logger.info(`Server activated and mapping routes on port ${PORT}`);

            // Run heavy seeding and migrations in the background so Fly.io health checks don't timeout
            (async () => {
                try {
                    const queryInterface = sequelize.getQueryInterface();
                    const Sequelize = require('sequelize');
                    
                    const addColumnSafe = async (tableName: string, columnName: string, options: any) => {
                        try {
                            await queryInterface.addColumn(tableName, columnName, options);
                            logger.info(`Added ${columnName} to ${tableName}`);
                        } catch (e: any) {
                            if (e.message && e.message.includes('Duplicate column name')) {
                                // Ignore
                            } else {
                                logger.error(`Failed to add ${columnName}:`, e.message);
                            }
                        }
                    };

                    await addColumnSafe('tickets', 'receipt_url', { type: Sequelize.TEXT, allowNull: true });
                    await addColumnSafe('tickets', 'receipt_reference', { type: Sequelize.STRING, allowNull: true });
                    await addColumnSafe('tickets', 'payment_status', { type: Sequelize.ENUM('unpaid', 'receipt_submitted', 'payment_verified'), defaultValue: 'unpaid', allowNull: false });
                    await addColumnSafe('tickets', 'course_access_granted', { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false });
                    await addColumnSafe('tickets', 'ticket_sequence_number', { type: Sequelize.INTEGER, allowNull: true });
                    await addColumnSafe('users', 'subsidyPercentage', { type: Sequelize.INTEGER, allowNull: true, defaultValue: 70 });
                    await addColumnSafe('users', 'psychometricModule1Passed', { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false });
                    await addColumnSafe('users', 'psychometricModule2Passed', { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false });
                    await addColumnSafe('users', 'psychometricCompletedAt', { type: Sequelize.DATE, allowNull: true });
                    await addColumnSafe('users', 'depositPaid', { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false });
                    await addColumnSafe('users', 'depositPaidAt', { type: Sequelize.DATE, allowNull: true });
                    await addColumnSafe('users', 'fullBalancePaid', { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false });

                    // Fix tickets for existing applications
                    const { Application, JobListing, TicketCatalog, Course, Ticket, User } = require('./models');
                    const { Op } = require('sequelize');

                    const apps = await Application.findAll({
                        include: [
                            { model: JobListing },
                            { model: Ticket, as: 'Tickets' }
                        ]
                    });

                    for (const app of apps) {
                        const anyApp = app as any;
                        if (!anyApp.Tickets || anyApp.Tickets.length === 0) {
                            const job = anyApp.JobListing;
                            if (job && Array.isArray(job.ticketIds) && job.ticketIds.length > 0) {
                                logger.info(`Fixing application ${app.id} for user ${app.userId}...`);
                                const catalogTickets = await TicketCatalog.findAll({
                                    where: { id: { [Op.in]: job.ticketIds } }
                                });

                                for (const cat of catalogTickets) {
                                    const catNameLower = (cat.name || '').toLowerCase();
                                    const matchingCourse = await Course.findOne({
                                        where: {
                                            [Op.or]: [
                                                { title: { [Op.like]: `%${cat.name}%` } },
                                                ...(catNameLower.split(' ')
                                                    .filter((w: string) => w.length > 4)
                                                    .slice(0, 2)
                                                    .map((w: string) => ({ title: { [Op.like]: `%${w}%` } })))
                                            ]
                                        }
                                    });

                                    const applicant = await User.findByPk(app.userId);
                                    const normalPrice = cat.normalPrice || 0;

                                    await Ticket.create({
                                        userId: app.userId,
                                        applicationId: app.id,
                                        ticketType: cat.name,
                                        catalogId: cat.id || null,
                                        status: 'not_possessed',
                                        ticketSponsorship: 'no_application',
                                        refundStatus: 'none',
                                        description: cat.description,
                                        realPrice: normalPrice,
                                        purchasePrice: normalPrice,
                                        canApplySponsorship: true,
                                        courseId: matchingCourse ? matchingCourse.id : null
                                    });
                                    logger.info(`Added ticket ${cat.name} to application ${app.id}`);
                                }
                            }
                        }
                    }

                    await registerCrons()
                    logger.info('QStash endpoints are ready for background jobs.');

                    logger.info('Database seeded successfully in background.');
                } catch (err) {
                    logger.error('Background database initialization error:', err);
                }
            })();

            if (process.env.NODE_ENV !== 'production') {
                logger.info('Database Synchronized successfully.');
            }
        });
    } catch (error) {
        logger.error('Failed to initialize server processes comprehensively', error);
        process.exit(1);
    }
};

startServer();
