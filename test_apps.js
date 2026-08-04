
const { applicationRepository } = require('./server/src/repositories/ApplicationRepository');
const { sequelize } = require('./server/src/config/database');

async function test() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        const app = await applicationRepository.findById(1);
        console.log("APP_JSON=" + JSON.stringify(app, null, 2));
    } catch(e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}
test();
