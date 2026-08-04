import { applicationRepository } from './src/repositories/ApplicationRepository';
import { sequelize } from './src/config/database';

async function test() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        const app = await applicationRepository.findAllAdmin({ limit: 1 });
        console.log(JSON.stringify(app, null, 2));
    } catch(e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}
test();
