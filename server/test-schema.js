require('dotenv').config();
const { sequelize } = require('./dist/config/database');
async function run() {
  const [results] = await sequelize.query("DESCRIBE job_stages;");
  console.log(results);
  process.exit(0);
}
run();
