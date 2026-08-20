import { Request, Response } from 'express';
import { PrefillStage } from '../models/PrefillStage';
import { sequelize } from '../config/database';

export class PrefillStageController {
    public async getPrefillStages(req: Request, res: Response): Promise<void> {
        try {
            const stages = await PrefillStage.findAll({ order: [['orderIndex', 'ASC']] });
            res.json({ success: true, data: stages });
        } catch (error: any) {
            console.error('[PrefillStageController] Error fetching stages:', error);
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    public async createPrefillStage(req: Request, res: Response): Promise<void> {
        try {
            const { name, type, adminDisplay, applicantDisplay, orderIndex } = req.body;
            if (!name || !type) {
                res.status(400).json({ success: false, message: 'Name and type are required' });
                return;
            }

            let newOrderIndex = orderIndex;
            if (newOrderIndex !== undefined && newOrderIndex !== null) {
                newOrderIndex = parseInt(newOrderIndex, 10);
                await sequelize.query(
                    `UPDATE prefill_stages SET orderIndex = orderIndex + 1 WHERE orderIndex >= :newOrderIndex AND type = :type`,
                    { replacements: { newOrderIndex, type } }
                );
            } else {
                const count = await PrefillStage.count({ where: { type } });
                newOrderIndex = count + 1;
            }

            const stage = await PrefillStage.create({
                name,
                type,
                adminDisplay,
                applicantDisplay,
                orderIndex: newOrderIndex
            });
            res.status(201).json({ success: true, data: stage });
        } catch (error: any) {
            console.error('[PrefillStageController] Error creating stage:', error);
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    public async updatePrefillStage(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { name, type, adminDisplay, applicantDisplay, orderIndex } = req.body;

            const stage = await PrefillStage.findByPk(id as string);
            if (!stage) {
                res.status(404).json({ success: false, message: 'Stage not found' });
                return;
            }

            let newOrderIndex = orderIndex;
            if (newOrderIndex !== undefined && newOrderIndex !== null) {
                newOrderIndex = parseInt(newOrderIndex, 10);
                if (newOrderIndex !== stage.orderIndex) {
                    await sequelize.query(
                        `UPDATE prefill_stages SET orderIndex = orderIndex + 1 WHERE orderIndex >= :newOrderIndex AND id != :id AND type = :type`,
                        { replacements: { newOrderIndex, id: stage.id, type: stage.type } }
                    );
                }
            }

            await stage.update({ name, type, adminDisplay, applicantDisplay, orderIndex: newOrderIndex !== undefined ? newOrderIndex : stage.orderIndex });
            res.json({ success: true, data: stage });
        } catch (error: any) {
            console.error('[PrefillStageController] Error updating stage:', error);
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    public async deletePrefillStage(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const stage = await PrefillStage.findByPk(id as string);
            if (!stage) {
                res.status(404).json({ success: false, message: 'Stage not found' });
                return;
            }

            await stage.destroy();
            res.json({ success: true, message: 'Stage deleted' });
        } catch (error: any) {
            console.error('[PrefillStageController] Error deleting stage:', error);
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    public async reorderPrefillStages(req: Request, res: Response): Promise<void> {
        try {
            const { password, stages: updates } = req.body; // updates: Array<{ id: number, orderIndex: number }>
            if (password !== '12397') {
                res.status(403).json({ success: false, message: 'Invalid reorder password' });
                return;
            }

            await sequelize.transaction(async (t) => {
                for (const update of updates) {
                    await PrefillStage.update(
                        { orderIndex: update.orderIndex },
                        { where: { id: update.id }, transaction: t }
                    );
                }
            });

            res.json({ success: true, message: 'Reordered successfully' });
        } catch (error: any) {
            console.error('[PrefillStageController] Error reordering stages:', error);
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }
}
