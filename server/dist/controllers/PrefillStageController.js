"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefillStageController = void 0;
const PrefillStage_1 = require("../models/PrefillStage");
const database_1 = require("../config/database");
class PrefillStageController {
    async getPrefillStages(req, res) {
        try {
            const stages = await PrefillStage_1.PrefillStage.findAll({ order: [['orderIndex', 'ASC']] });
            res.json({ success: true, data: stages });
        }
        catch (error) {
            console.error('[PrefillStageController] Error fetching stages:', error);
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }
    async createPrefillStage(req, res) {
        try {
            const { name, type, adminDisplay, applicantDisplay, orderIndex } = req.body;
            if (!name || !type) {
                res.status(400).json({ success: false, message: 'Name and type are required' });
                return;
            }
            let newOrderIndex = orderIndex;
            if (newOrderIndex !== undefined && newOrderIndex !== null) {
                newOrderIndex = parseInt(newOrderIndex, 10);
                await database_1.sequelize.query(`UPDATE prefill_stages SET orderIndex = orderIndex + 1 WHERE orderIndex >= :newOrderIndex`, { replacements: { newOrderIndex } });
            }
            else {
                const count = await PrefillStage_1.PrefillStage.count({ where: { type } });
                newOrderIndex = count + 1;
            }
            const stage = await PrefillStage_1.PrefillStage.create({
                name,
                type,
                adminDisplay,
                applicantDisplay,
                orderIndex: newOrderIndex
            });
            res.status(201).json({ success: true, data: stage });
        }
        catch (error) {
            console.error('[PrefillStageController] Error creating stage:', error);
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }
    async updatePrefillStage(req, res) {
        try {
            const { id } = req.params;
            const { name, type, adminDisplay, applicantDisplay, orderIndex } = req.body;
            const stage = await PrefillStage_1.PrefillStage.findByPk(id);
            if (!stage) {
                res.status(404).json({ success: false, message: 'Stage not found' });
                return;
            }
            let newOrderIndex = orderIndex;
            if (newOrderIndex !== undefined && newOrderIndex !== null) {
                newOrderIndex = parseInt(newOrderIndex, 10);
                if (newOrderIndex !== stage.orderIndex) {
                    if (newOrderIndex < stage.orderIndex) {
                        await database_1.sequelize.query(`UPDATE prefill_stages SET orderIndex = orderIndex + 1 WHERE orderIndex >= :newOrderIndex AND orderIndex < :oldOrderIndex AND id != :id`, { replacements: { newOrderIndex, oldOrderIndex: stage.orderIndex, id: stage.id } });
                    }
                    else {
                        await database_1.sequelize.query(`UPDATE prefill_stages SET orderIndex = orderIndex - 1 WHERE orderIndex <= :newOrderIndex AND orderIndex > :oldOrderIndex AND id != :id`, { replacements: { newOrderIndex, oldOrderIndex: stage.orderIndex, id: stage.id } });
                    }
                }
            }
            await stage.update({ name, type, adminDisplay, applicantDisplay, orderIndex: newOrderIndex !== undefined ? newOrderIndex : stage.orderIndex });
            res.json({ success: true, data: stage });
        }
        catch (error) {
            console.error('[PrefillStageController] Error updating stage:', error);
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }
    async deletePrefillStage(req, res) {
        try {
            const { id } = req.params;
            const stage = await PrefillStage_1.PrefillStage.findByPk(id);
            if (!stage) {
                res.status(404).json({ success: false, message: 'Stage not found' });
                return;
            }
            await stage.destroy();
            res.json({ success: true, message: 'Stage deleted' });
        }
        catch (error) {
            console.error('[PrefillStageController] Error deleting stage:', error);
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }
    async reorderPrefillStages(req, res) {
        try {
            const { password, stages: updates } = req.body; // updates: Array<{ id: number, orderIndex: number }>
            if (password !== '12397') {
                res.status(403).json({ success: false, message: 'Invalid reorder password' });
                return;
            }
            await database_1.sequelize.transaction(async (t) => {
                for (const update of updates) {
                    await PrefillStage_1.PrefillStage.update({ orderIndex: update.orderIndex }, { where: { id: update.id }, transaction: t });
                }
            });
            res.json({ success: true, message: 'Reordered successfully' });
        }
        catch (error) {
            console.error('[PrefillStageController] Error reordering stages:', error);
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }
}
exports.PrefillStageController = PrefillStageController;
