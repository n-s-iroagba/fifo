import { sequelize } from './src/config/database';
import { JobListing, TicketCatalog, Application, User, Course, Ticket } from './src/models';
import { Op } from 'sequelize';

async function main() {
    await sequelize.authenticate();
    
    // Find applications with no tickets
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
                console.log(`Fixing application ${app.id} for user ${app.userId}...`);
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
                    const subsidyPct = applicant?.subsidyPercentage ?? 70;
                    const normalPrice = cat.normalPrice || 0;
                    const calcSubsidisedPrice = Number((normalPrice * (1 - subsidyPct / 100)).toFixed(2));

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
                        subsidisedPrice: calcSubsidisedPrice,
                        purchasePrice: calcSubsidisedPrice,
                        canApplySponsorship: true,
                        courseId: matchingCourse ? matchingCourse.id : null
                    });
                    console.log(`Added ticket ${cat.name} to application ${app.id}`);
                }
            }
        }
    }
    process.exit(0);
}
main().catch(console.error);
