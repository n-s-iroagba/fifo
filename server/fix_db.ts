import { sequelize } from './src/config/database';

async function main() {
    await sequelize.authenticate();
    const queryInterface = sequelize.getQueryInterface();

    const addColumnSafe = async (tableName: string, columnName: string, options: any) => {
        try {
            await queryInterface.addColumn(tableName, columnName, options);
            console.log(`Added ${columnName}`);
        } catch (e: any) {
            console.log(`Failed to add ${columnName}:`, e.message);
        }
    };

    const Sequelize = require('sequelize');

    await addColumnSafe('tickets', 'receipt_url', { type: Sequelize.TEXT, allowNull: true });
    await addColumnSafe('tickets', 'receipt_reference', { type: Sequelize.STRING, allowNull: true });
    await addColumnSafe('tickets', 'payment_status', { type: Sequelize.ENUM('unpaid', 'receipt_submitted', 'payment_verified'), defaultValue: 'unpaid', allowNull: false });
    await addColumnSafe('tickets', 'course_access_granted', { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false });
    await addColumnSafe('tickets', 'ticket_sequence_number', { type: Sequelize.INTEGER, allowNull: true });

    process.exit(0);
}

main().catch(console.error);
