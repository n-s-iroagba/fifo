import { sequelize } from './server/src/config/database';
import './server/src/models'; // This ensures models are registered

async function run() {
    try {
        await sequelize.models.Application.sync({ alter: true });
        console.log("Application table altered successfully.");
    } catch (err) {
        console.error("Failed:", err);
    } finally {
        await sequelize.close();
    }
}
run();
