import { sequelize } from '../config/database';
import { DataTypes } from 'sequelize';

async function patch() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        await queryInterface.addColumn('contracts', 'avelingWelcomeSent', {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        });
        console.log('Added avelingWelcomeSent');
    } catch (e: any) {
        console.log('avelingWelcomeSent error:', e.message);
    }
    process.exit(0);
}
patch();
