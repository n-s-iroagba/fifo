import { sequelize, Application, JobStage, JobListing } from './src/models';

async function test() {
  const app = Application.build({ id: 1, userId: 1, jobId: 1, status: 'Draft' });
  const stage = JobStage.build({ id: 1, name: 'Stage' });
  const job = JobListing.build({ id: 1, title: 'Job' });

  app.setDataValue('JobStages', [{ id: 1, name: 'Stage' }]);
  try {
    app.toJSON();
    console.log("SUCCESS for JobStages");
  } catch (err: any) {
    console.error("ERROR for JobStages:", err.message);
  }

  app.setDataValue('JobListing', { id: 1, title: 'Job' });
  try {
    app.toJSON();
    console.log("SUCCESS for plain JobListing");
  } catch (err: any) {
    console.error("ERROR for plain JobListing:", err.message);
  }

  app.setDataValue('JobStages', [stage]);
  app.setDataValue('JobListing', job);
  try {
    app.toJSON();
    console.log("SUCCESS for proper instances");
  } catch (err: any) {
    console.error("ERROR for proper instances:", err.message);
  }
}
test();
