import { sequelize, Application, JobStage } from './src/models';

async function test() {
  const newApp = await Application.build({ userId: 1, jobId: 1, status: 'Draft', currentStageId: null });
  
  newApp.setDataValue('ExamAttempts', [{ id: 1, score: 95 }]);
  try {
    newApp.toJSON();
    console.log("SUCCESS for ExamAttempts plain objects");
  } catch (err: any) {
    console.error("ERROR for ExamAttempts:", err.message);
  }
}
test();
