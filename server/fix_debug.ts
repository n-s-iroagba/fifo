import { JobStage, Application, sequelize } from './src/models';

async function main() {
    try {
        const appId = 23;
        const stages = await JobStage.findAll({
            where: { applicationId: appId }
        });

        console.log(stages.map((s: any) => ({ id: s.id, name: s.name, status: s.status })));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
main();
