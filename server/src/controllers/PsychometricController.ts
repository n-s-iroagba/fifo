import { Request, Response } from 'express';
import { CONSTANTS } from '../constants';
import { User } from '../models/User';
import { PsychometricAttempt } from '../models/PsychometricAttempt';
import { psychometricModule1Questions } from '../data/psychometricModule1Questions';
import { psychometricModule2Questions } from '../data/psychometricModule2Questions';
import { Op } from 'sequelize';

export class PsychometricController {
    public async getStatus(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const user = await User.findByPk(userId);
            if (!user) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'User not found' });
                return;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const attemptsToday = await PsychometricAttempt.findAll({
                where: {
                    userId,
                    createdAt: {
                        [Op.gte]: today
                    }
                }
            });

            const lastAttemptToday = {
                module_1: attemptsToday.some(a => a.module === 'module_1'),
                module_2: attemptsToday.some(a => a.module === 'module_2')
            };

            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                module1Passed: user.psychometricModule1Passed,
                module2Passed: user.psychometricModule2Passed,
                completedAt: user.psychometricCompletedAt,
                lastAttemptToday
            });
        } catch (error: any) {
            console.error('[PsychometricController.getStatus]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async getQuestions(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const moduleParam = req.params.module; // '1' or '2'
            const moduleEnum = moduleParam === '1' ? 'module_1' : 'module_2';

            const user = await User.findByPk(userId);
            if (!user) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'User not found' });
                return;
            }

            if (moduleEnum === 'module_1' && user.psychometricModule1Passed) {
                res.status(CONSTANTS.HTTP_STATUS.OK).json({ alreadyPassed: true });
                return;
            }
            if (moduleEnum === 'module_2' && user.psychometricModule2Passed) {
                res.status(CONSTANTS.HTTP_STATUS.OK).json({ alreadyPassed: true });
                return;
            }

            // Enforce Module 1 must be passed before Module 2
            if (moduleEnum === 'module_2' && !user.psychometricModule1Passed) {
                res.status(CONSTANTS.HTTP_STATUS.FORBIDDEN).json({ error: 'You must pass Module 1 before starting Module 2.' });
                return;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const attemptToday = await PsychometricAttempt.findOne({
                where: {
                    userId,
                    module: moduleEnum,
                    createdAt: {
                        [Op.gte]: today
                    }
                }
            });

            if (attemptToday) {
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                res.status(CONSTANTS.HTTP_STATUS.OK).json({ cooldownActive: true, tryAgainAt: tomorrow });
                return;
            }

            let questions = moduleEnum === 'module_1' ? [...psychometricModule1Questions] : [...psychometricModule2Questions];

            // Shuffle questions for Module 1 and pick 25
            if (moduleEnum === 'module_1') {
                questions = questions.sort(() => 0.5 - Math.random()).slice(0, 25);
            }

            // Strip out correctOptionIndex
            const safeQuestions = questions.map(q => {
                const { correctOptionIndex, ...safeQ } = q;
                return safeQ;
            });

            res.status(CONSTANTS.HTTP_STATUS.OK).json({ questions: safeQuestions });
        } catch (error: any) {
            console.error('[PsychometricController.getQuestions]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async submitModule(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const moduleParam = req.params.module; // '1' or '2'
            const moduleEnum = moduleParam === '1' ? 'module_1' : 'module_2';
            const { answers } = req.body; // Array<{ questionText: string, selectedOption: number }>

            const user = await User.findByPk(userId);
            if (!user) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'User not found' });
                return;
            }

            if (moduleEnum === 'module_1' && user.psychometricModule1Passed) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: 'Module already passed' });
                return;
            }
            if (moduleEnum === 'module_2' && user.psychometricModule2Passed) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: 'Module already passed' });
                return;
            }
            if (moduleEnum === 'module_2' && !user.psychometricModule1Passed) {
                res.status(CONSTANTS.HTTP_STATUS.FORBIDDEN).json({ error: 'You must pass Module 1 before starting Module 2.' });
                return;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const attemptToday = await PsychometricAttempt.findOne({
                where: {
                    userId,
                    module: moduleEnum,
                    createdAt: {
                        [Op.gte]: today
                    }
                }
            });

            if (attemptToday) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: 'You have already attempted this module today.' });
                return;
            }

            const fullQuestions = moduleEnum === 'module_1' ? psychometricModule1Questions : psychometricModule2Questions;
            
            let totalWeight = 0;
            let earnedWeight = 0;

            for (const ans of answers) {
                // Find original question by text to get weight and correct index
                const q = fullQuestions.find(fq => fq.questionText === ans.questionText);
                if (q) {
                    totalWeight += q.weight;
                    if (q.correctOptionIndex === ans.selectedOption) {
                        earnedWeight += q.weight;
                    }
                }
            }
            const requiredAnswers = moduleEnum === 'module_1' ? 25 : 20;
            let score = 0;

            if (answers.length < requiredAnswers) {
                // If they don't submit the full amount of questions, it's an automatic zero to prevent cheating
                score = 0;
            } else if (totalWeight > 0) {
                // Calculate percentage score
                score = (earnedWeight / totalWeight) * 100;
            }

            const passThreshold = moduleEnum === 'module_1' ? 70 : 80;
            const passed = score >= passThreshold;

            await PsychometricAttempt.create({
                userId,
                module: moduleEnum,
                score,
                passed,
                answers
            });

            let fullyCompleted = false;

            if (passed) {
                if (moduleEnum === 'module_1') {
                    user.psychometricModule1Passed = true;
                } else {
                    user.psychometricModule2Passed = true;
                }

                if (user.psychometricModule1Passed && user.psychometricModule2Passed) {
                    user.psychometricCompletedAt = new Date();
                    fullyCompleted = true;
                }
                await user.save();
            }

            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                score,
                passed,
                module1Passed: user.psychometricModule1Passed,
                module2Passed: user.psychometricModule2Passed,
                fullyCompleted
            });
        } catch (error: any) {
            console.error('[PsychometricController.submitModule]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
}

export const psychometricController = new PsychometricController();
