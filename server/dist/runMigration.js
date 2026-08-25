"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const migrations_1 = require("./migrations");
async function run() {
    await (0, migrations_1.runAllMigrations)();
}
