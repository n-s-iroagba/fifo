import { Ticket } from './src/models';

async function main() {
    try {
        const userId = 24;
        const tickets = await Ticket.findAll({ where: { userId } });
        
        console.log('Tickets for user 24:');
        for (const t of tickets) {
            console.log(`- ID: ${t.id}, Type: ${t.ticketType}, Sponsorship: ${t.ticketSponsorship}`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
main();
