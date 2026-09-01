import { User } from './src/models';
import { sendInfoEmail } from './src/utils/email';

async function main() {
    try {
        const userId = 24; 
        const user = await User.findByPk(userId);
        if (user) {
            const subject = 'Action Required: Ticket Uploads & Sponsorship Application';
            const content = `
                <p>Dear ${user.fullName},</p>
                <p>With your nomination approved, it is time for the final administrative step before finalizing your contract.</p>
                <p>Please log in to your dashboard and visit the <strong>Tickets</strong> section. You must upload proof of any required tickets you already possess. For the tickets you do not currently hold, you can easily apply for our Ticket Sponsorship program directly on the same page.</p>
                <div class="cta-block">
                    <a href="${process.env.CLIENT_URL || 'https://www.bluecollarrecruitment.co'}/dashboard/tickets" class="button">Go To Ticket Sponsorship Page</a>
                </div>
            `;
            await sendInfoEmail(user.email, subject, content);
            console.log('Sent Ticket Uploads & Sponsorship Application Mail');
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
