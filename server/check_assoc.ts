import { sequelize } from './src/config/database';
import { Application, JobListing } from './src/models';

async function test() {
    try {
        await sequelize.authenticate();
        const app = await Application.findByPk(1, { include: [JobListing] });
        console.log('APP:', app ? app.toJSON() : 'null');
    } catch(e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}
test();
