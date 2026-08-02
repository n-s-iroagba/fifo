import { Interest } from '../models';

export class InterestService {
    public async createInterest(userId: number, data: any) {
        return Interest.create({
            userId,
            ...data
        });
    }

    public async getUserInterest(userId: number) {
        return Interest.findOne({ where: { userId } });
    }

    public async getAllInterests() {
        return Interest.findAll({
            include: ['User']
        });
    }
}

export const interestService = new InterestService();
