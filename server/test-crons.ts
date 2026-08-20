import { runApplicationApprovalCron } from './src/cron/applicationCron';
import { sequelize } from './src/config/database';

async function test() {
    try {
        await sequelize.authenticate();
        await runApplicationApprovalCron();
    } catch (e) {
        console.error("Test failed:", e);
    } finally {
        await sequelize.close();
    }
}
test();
