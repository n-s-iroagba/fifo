import { sequelize } from '../config/database';
import { DataTypes } from 'sequelize';

async function patch() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        await queryInterface.addColumn('contracts', 'documentUrl1', {
            type: DataTypes.STRING,
            allowNull: true
        });
        console.log('Added documentUrl1');
    } catch (e) {
        console.log('documentUrl1 already exists or error:', e);
    }

    try {
        const queryInterface = sequelize.getQueryInterface();
        await queryInterface.addColumn('contracts', 'documentUrl15', {
            type: DataTypes.STRING,
            allowNull: true
        });
    } catch (e) {
        console.log('documentUrl15 already exists or error:', e);
    }
    process.exit(0);
}
patch();
