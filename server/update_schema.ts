import { sequelize } from './src/config/database';
import './src/models';

async function run() {
    try {
        await sequelize.models.User.sync({ alter: true });
        console.log("User table altered successfully.");
        await sequelize.models.Ticket.sync({ alter: true });
        console.log("Ticket table altered successfully.");
    } catch (err) {
        console.error("Failed:", err);
    } finally {
        await sequelize.close();
    }
}
run();
