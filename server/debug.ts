import { Application, JobStage } from './src/models';

async function debug() {
    const app = await Application.findByPk(23);
    console.log('App:', app?.toJSON());
    
    const stages = await JobStage.findAll({ where: { applicationId: 23 } });
    console.log('Stages:', stages.map(s => s.toJSON()));
    
    process.exit(0);
}

debug();
