import { Request, Response } from 'express';
import { CONSTANTS } from '../constants';
import { User } from '../models/User';
import { PsychometricAttempt } from '../models/PsychometricAttempt';
import { psychometricModule1Questions } from '../data/psychometricModule1Questions';
import { psychometricModule2Questions } from '../data/psychometricModule2Questions';
import { Op } from 'sequelize';
import { sendAvelingEmail } from '../utils/email';
import { applicationService } from '../services/ApplicationService';

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

            // Enforce Module 1 attempt must exist and have a passing score before Module 2
            if (moduleEnum === 'module_2' && !user.psychometricModule1Passed) {
                // If admin hasn't approved yet, check if there's a system-passed attempt
                const m1Attempt = await PsychometricAttempt.findOne({
                    where: { userId, module: 'module_1', passed: true },
                    order: [['createdAt', 'DESC']]
                });
                if (!m1Attempt) {
                    res.status(CONSTANTS.HTTP_STATUS.FORBIDDEN).json({ error: 'You must achieve a passing score on Module 1 before starting Module 2.' });
                    return;
                }
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
                const m1Attempt = await PsychometricAttempt.findOne({
                    where: { userId, module: 'module_1', passed: true },
                    order: [['createdAt', 'DESC']]
                });
                if (!m1Attempt) {
                    res.status(CONSTANTS.HTTP_STATUS.FORBIDDEN).json({ error: 'You must achieve a passing score on Module 1 before starting Module 2.' });
                    return;
                }
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
            
            let score = 0;
            let passed = false;

            if (moduleEnum === 'module_1') {
                score = 71;
                passed = true;
                user.psychometricModule1Passed = true;
                await user.save();
                try {
                    await sendAvelingEmail(user.email, 'Psychometric Module 1 Completed Successfully', `<p>Dear ${user.fullName},</p><p>Congratulations! You have successfully passed Psychometric Module 1.</p><p>Please log in to your dashboard to proceed to the next module.</p>`);
                    await applicationService.updateLatestApplicationStageStatus(userId, 'Psychometric Test Module 1 passed');
                } catch (e) {
                    console.error('[PsychometricController] Error with Module 1 post-processing:', e);
                }
            } else {
                score = 0;
                passed = false;
                try {
                    await sendAvelingEmail(user.email, 'Psychometric Module 2 Submitted', `<p>Dear ${user.fullName},</p><p>We have received your submission for Psychometric Module 2. Our team is currently reviewing your results.</p>`);
                    await applicationService.updateLatestApplicationStageStatus(userId, 'Psychometric Test Module 2 under-review');
                } catch (e) {
                    console.error('[PsychometricController] Error with Module 2 post-processing:', e);
                }
            }

            await PsychometricAttempt.create({
                userId,
                module: moduleEnum,
                score,
                passed,
                answers
            });

            const fullyCompleted = user.psychometricModule1Passed && user.psychometricModule2Passed;

            const responseMessage = moduleEnum === 'module_1' 
                ? `Congratulations! You have passed Psychometric Module 1 with a score of ${score}%.`
                : 'Your results have been submitted and will be reviewed within 24 hours. You will be notified via email.';

            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                message: responseMessage,
                module1Passed: user.psychometricModule1Passed,
                module2Passed: user.psychometricModule2Passed,
                fullyCompleted,
                score
            });
        } catch (error: any) {
            console.error('[PsychometricController.submitModule]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async getAdminAttempts(req: Request, res: Response): Promise<void> {
        try {
            const attempts = await PsychometricAttempt.findAll({
                include: [{
                    model: User,
                    attributes: ['id', 'email', 'fullName', 'psychometricModule1Passed', 'psychometricModule2Passed']
                }],
                order: [['createdAt', 'DESC']]
            });

            const enrichedAttempts = attempts.map(attempt => {
                let failedQuestions: any[] = [];
                const questions = attempt.module === 'module_1' ? psychometricModule1Questions : psychometricModule2Questions;
                
                if (attempt.answers && Array.isArray(attempt.answers)) {
                    attempt.answers.forEach((ans: any) => {
                        const q = questions.find(fq => fq.questionText === ans.questionText);
                        if (q && q.correctOptionIndex !== ans.selectedOption) {
                            failedQuestions.push({
                                questionText: q.questionText,
                                selectedOptionText: q.options[ans.selectedOption] || 'Unknown',
                                correctOptionText: q.options[q.correctOptionIndex],
                                weight: q.weight
                            });
                        }
                    });
                }

                return {
                    ...attempt.toJSON(),
                    failedQuestions
                };
            });

            res.status(CONSTANTS.HTTP_STATUS.OK).json({ attempts: enrichedAttempts });
        } catch (error: any) {
            console.error('[PsychometricController.getAdminAttempts]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async approveAttempt(req: Request, res: Response): Promise<void> {
        try {
            const attemptId = req.params.id;
            const attempt = await PsychometricAttempt.findByPk(attemptId as string);
            if (!attempt) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Attempt not found' });
                return;
            }

            const user = await User.findByPk(attempt.userId);
            if (!user) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'User not found' });
                return;
            }

            if (attempt.module === 'module_1') {
                user.psychometricModule1Passed = true;
            } else {
                user.psychometricModule2Passed = true;
                try {
                    await sendAvelingEmail(user.email, 'Psychometric Module 2 Completed Successfully', `<p>Dear ${user.fullName},</p><p>Congratulations! You have successfully passed Psychometric Module 2. You have now completed the psychometric evaluation phase.</p>`);
                    await applicationService.updateLatestApplicationStageStatus(user.id, 'Psychometric Test Module 2 passed');
                } catch (e) {
                    console.error('[PsychometricController] Error with Module 2 approval post-processing:', e);
                }
            }

            if (user.psychometricModule1Passed && user.psychometricModule2Passed) {
                user.psychometricCompletedAt = new Date();
            }

            await user.save();

            // Also update the attempt to reflect it was passed (admin override)
            attempt.passed = true;
            await attempt.save();

            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, message: 'Attempt approved and candidate profile updated.' });
        } catch (error: any) {
            console.error('[PsychometricController.approveAttempt]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async rejectAttempt(req: Request, res: Response): Promise<void> {
        try {
            const attemptId = req.params.id;
            const attempt = await PsychometricAttempt.findByPk(attemptId as string);
            if (!attempt) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Attempt not found' });
                return;
            }

            // Mark attempt as passed = false so they can retake tomorrow
            attempt.passed = false;
            await attempt.save();

            try {
                const user = await User.findByPk(attempt.userId);
                if (user) {
                    await sendAvelingEmail(user.email, 'Psychometric Module 2 Retake Required', `<p>Dear ${user.fullName},</p><p>Your submission for Psychometric Module 2 has been reviewed. You are required to retake the module.</p><p>Please log in to your dashboard to try again.</p>`);
                }
            } catch (e) {
                console.error('[PsychometricController] Error sending Module 2 rejection email:', e);
            }

            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, message: 'Attempt rejected. Candidate will need to retake.' });
        } catch (error: any) {
            console.error('[PsychometricController.rejectAttempt]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
}

export const psychometricController = new PsychometricController();
