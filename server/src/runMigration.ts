import { sequelize } from './config/database';
import { migrateApexNetwork } from './migrations/apex_network_migration';

export async function run() {
    // Existing migrations...
    try {
        await sequelize.query('ALTER TABLE crypto_wallets MODIFY COLUMN currencyName VARCHAR(255);');
        await sequelize.query('ALTER TABLE crypto_wallets MODIFY COLUMN networkType VARCHAR(255);');
        console.log('Relaxed ENUM constraints in crypto_wallets');
    } catch (e: any) {
        console.error('Error relaxing crypto constraints:', e.message);
    }

    // New Apex Network Migration
    await migrateApexNetwork();
}

