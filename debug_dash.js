require('dotenv').config({ path: './server/.env' });
const { applicationRepository } = require('./server/dist/repositories/ApplicationRepository');
const { connectDB } = require('./server/dist/config/database');
const { Application } = require('./server/dist/models/Application');

async function test() {
    await connectDB();
    const result = await applicationRepository.findByUserId(1); // I'll get all apps and see what's what
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
}
test().catch(console.error);
