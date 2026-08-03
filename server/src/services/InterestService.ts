import { Interest } from '../models';

export class InterestService {
    public async createInterest(userId: number, data: any) {
        return Interest.create({
            userId,
            ...data
        });
    }

    public async updateInterest(userId: number, data: any) {
        const [updated] = await Interest.update(data, { where: { userId } });
        if (updated) {
            return Interest.findOne({ where: { userId } });
        }
        return null;
    }

    public async deleteInterest(id: number) {
        return Interest.destroy({ where: { id } });
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
