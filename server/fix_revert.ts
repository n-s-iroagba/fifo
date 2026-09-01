import { JobStage, Application, sequelize } from './src/models';

async function main() {
    try {
        const appId = 23;
        console.log(`Reverting Application ${appId}`);

        // Find TicketSponsorship stage
        const tsStage = await JobStage.findOne({
            where: { applicationId: appId, name: 'TicketSponsorship' }
        });

        if (!tsStage) {
            console.error('TicketSponsorship stage not found');
            process.exit(1);
        }

        // 1. Update TicketSponsorship status to 'Not Started'
        await tsStage.update({ status: 'Not Started' });
        console.log('TicketSponsorship status reverted to "Not Started"');

        // 2. Set currentStageId back to TicketSponsorship stage
        const app = await Application.findByPk(appId);
        if (app) {
            await app.update({ currentStageId: tsStage.id });
            console.log(`Application currentStageId set to ${tsStage.id}`);
        }

        // 3. Remove the 'Contract' stage
        const contractStage = await JobStage.findOne({
            where: { applicationId: appId, name: 'Contract' }
        });

        if (contractStage) {
            await contractStage.destroy();
            console.log('Removed Contract stage');
        } else {
            console.log('No Contract stage found to remove');
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
