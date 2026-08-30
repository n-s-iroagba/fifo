import { sequelize } from './src/config/database';
import { applicationService } from './src/services/ApplicationService';

async function test() {
  await sequelize.sync();
  try {
    const res = await applicationService.draftApplication(1, 1);
    console.log("SUCCESS:", res);
  } catch (err) {
    console.error("ERROR:", err);
  }
  process.exit(0);
}

test();
