import { sequelize, Application, JobStage } from './src/models';

async function test() {
  await sequelize.sync();
  // Create test data
  const newApp = await Application.create({ userId: 1, jobId: 1, status: 'Draft', currentStageId: null });
  
  // Find with include
  const app = await Application.findByPk(newApp.id, {
    include: [{ model: JobStage, as: 'JobStages' }]
  });

  if (!app) return;

  const defaultStage = await JobStage.create({ applicationId: app.id, name: 'Application', status: 'not started' });
  
  app.setDataValue('JobStages', [defaultStage.toJSON()]);
  try {
    app.toJSON();
    console.log("SUCCESS");
  } catch (err: any) {
    console.error("ERROR:", err.message);
  }
}
test();
