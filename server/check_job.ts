import { sequelize } from './src/config/database';
import { JobListing } from './src/models';

async function test() {
    try {
        await sequelize.authenticate();
        const job = await JobListing.findByPk(4);
        console.log('JOB:', job ? job.toJSON() : 'null');
    } catch(e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}
test();
