import { Ticket } from './src/models';

async function main() {
    try {
        const deletedCount = await Ticket.destroy({
            where: { applicationId: null }
        });
        
        console.log(`Successfully deleted ${deletedCount} tickets with no applicationId in production.`);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
main();
