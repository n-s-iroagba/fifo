"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interestService = exports.InterestService = void 0;
const models_1 = require("../models");
class InterestService {
    async createInterest(userId, data) {
        return models_1.Interest.create({
            userId,
            ...data
        });
    }
    async getUserInterest(userId) {
        return models_1.Interest.findOne({ where: { userId } });
    }
    async getAllInterests() {
        return models_1.Interest.findAll({
            include: ['User']
        });
    }
}
exports.InterestService = InterestService;
exports.interestService = new InterestService();
