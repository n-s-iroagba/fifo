"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runRtoTicketDeliveryCron = exports.runRtoWelcomeCron = exports.runAvelingTicketDeliveryCron = exports.runAvelingWelcomeCron = void 0;
/**
 * Backwards compatibility proxy: delegates to rtoCron.ts
 */
var rtoCron_1 = require("./rtoCron");
Object.defineProperty(exports, "runAvelingWelcomeCron", { enumerable: true, get: function () { return rtoCron_1.runRtoWelcomeCron; } });
Object.defineProperty(exports, "runAvelingTicketDeliveryCron", { enumerable: true, get: function () { return rtoCron_1.runRtoTicketDeliveryCron; } });
Object.defineProperty(exports, "runRtoWelcomeCron", { enumerable: true, get: function () { return rtoCron_1.runRtoWelcomeCron; } });
Object.defineProperty(exports, "runRtoTicketDeliveryCron", { enumerable: true, get: function () { return rtoCron_1.runRtoTicketDeliveryCron; } });
