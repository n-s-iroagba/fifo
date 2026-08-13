"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.psychometricController = exports.PsychometricController = void 0;
const constants_1 = require("../constants");
const User_1 = require("../models/User");
const PsychometricAttempt_1 = require("../models/PsychometricAttempt");
const psychometricModule1Questions_1 = require("../data/psychometricModule1Questions");
const psychometricModule2Questions_1 = require("../data/psychometricModule2Questions");
const sequelize_1 = require("sequelize");
class PsychometricController {
    async getStatus(req, res) {
        try {
            const userId = req.user.id;
            const user = await User_1.User.findByPk(userId);
            if (!user) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'User not found' });
                return;
            }
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const attemptsToday = await PsychometricAttempt_1.PsychometricAttempt.findAll({
                where: {
                    userId,
                    createdAt: {
                        [sequelize_1.Op.gte]: today
                    }
                }
            });
            const lastAttemptToday = {
                module_1: attemptsToday.some(a => a.module === 'module_1'),
                module_2: attemptsToday.some(a => a.module === 'module_2')
            };
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                module1Passed: user.psychometricModule1Passed,
                module2Passed: user.psychometricModule2Passed,
                completedAt: user.psychometricCompletedAt,
                lastAttemptToday
            });
        }
        catch (error) {
            console.error('[PsychometricController.getStatus]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async getQuestions(req, res) {
        try {
            const userId = req.user.id;
            const moduleParam = req.params.module; // '1' or '2'
            const moduleEnum = moduleParam === '1' ? 'module_1' : 'module_2';
            const user = await User_1.User.findByPk(userId);
            if (!user) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'User not found' });
                return;
            }
            if (moduleEnum === 'module_1' && user.psychometricModule1Passed) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ alreadyPassed: true });
                return;
            }
            if (moduleEnum === 'module_2' && user.psychometricModule2Passed) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ alreadyPassed: true });
                return;
            }
            // Enforce Module 1 attempt must exist and have a passing score before Module 2
            if (moduleEnum === 'module_2' && !user.psychometricModule1Passed) {
                // If admin hasn't approved yet, check if there's a system-passed attempt
                const m1Attempt = await PsychometricAttempt_1.PsychometricAttempt.findOne({
                    where: { userId, module: 'module_1', passed: true },
                    order: [['createdAt', 'DESC']]
                });
                if (!m1Attempt) {
                    res.status(constants_1.CONSTANTS.HTTP_STATUS.FORBIDDEN).json({ error: 'You must achieve a passing score on Module 1 before starting Module 2.' });
                    return;
                }
            }
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const attemptToday = await PsychometricAttempt_1.PsychometricAttempt.findOne({
                where: {
                    userId,
                    module: moduleEnum,
                    createdAt: {
                        [sequelize_1.Op.gte]: today
                    }
                }
            });
            if (attemptToday) {
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ cooldownActive: true, tryAgainAt: tomorrow });
                return;
            }
            let questions = moduleEnum === 'module_1' ? [...psychometricModule1Questions_1.psychometricModule1Questions] : [...psychometricModule2Questions_1.psychometricModule2Questions];
            // Shuffle questions for Module 1 and pick 25
            if (moduleEnum === 'module_1') {
                questions = questions.sort(() => 0.5 - Math.random()).slice(0, 25);
            }
            // Strip out correctOptionIndex
            const safeQuestions = questions.map(q => {
                const { correctOptionIndex, ...safeQ } = q;
                return safeQ;
            });
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ questions: safeQuestions });
        }
        catch (error) {
            console.error('[PsychometricController.getQuestions]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async submitModule(req, res) {
        try {
            const userId = req.user.id;
            const moduleParam = req.params.module; // '1' or '2'
            const moduleEnum = moduleParam === '1' ? 'module_1' : 'module_2';
            const { answers } = req.body; // Array<{ questionText: string, selectedOption: number }>
            const user = await User_1.User.findByPk(userId);
            if (!user) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'User not found' });
                return;
            }
            if (moduleEnum === 'module_1' && user.psychometricModule1Passed) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: 'Module already passed' });
                return;
            }
            if (moduleEnum === 'module_2' && user.psychometricModule2Passed) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: 'Module already passed' });
                return;
            }
            if (moduleEnum === 'module_2' && !user.psychometricModule1Passed) {
                const m1Attempt = await PsychometricAttempt_1.PsychometricAttempt.findOne({
                    where: { userId, module: 'module_1', passed: true },
                    order: [['createdAt', 'DESC']]
                });
                if (!m1Attempt) {
                    res.status(constants_1.CONSTANTS.HTTP_STATUS.FORBIDDEN).json({ error: 'You must achieve a passing score on Module 1 before starting Module 2.' });
                    return;
                }
            }
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const attemptToday = await PsychometricAttempt_1.PsychometricAttempt.findOne({
                where: {
                    userId,
                    module: moduleEnum,
                    createdAt: {
                        [sequelize_1.Op.gte]: today
                    }
                }
            });
            if (attemptToday) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: 'You have already attempted this module today.' });
                return;
            }
            const fullQuestions = moduleEnum === 'module_1' ? psychometricModule1Questions_1.psychometricModule1Questions : psychometricModule2Questions_1.psychometricModule2Questions;
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
            }
            else if (totalWeight > 0) {
                // Calculate percentage score
                score = (earnedWeight / totalWeight) * 100;
            }
            const passThreshold = moduleEnum === 'module_1' ? 70 : 80;
            const passed = score >= passThreshold;
            await PsychometricAttempt_1.PsychometricAttempt.create({
                userId,
                module: moduleEnum,
                score,
                passed,
                answers
            });
            const fullyCompleted = user.psychometricModule1Passed && user.psychometricModule2Passed;
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                message: 'Your results have been submitted and will be reviewed within 24 hours. You will be notified via email.',
                module1Passed: user.psychometricModule1Passed,
                module2Passed: user.psychometricModule2Passed,
                fullyCompleted
            });
        }
        catch (error) {
            console.error('[PsychometricController.submitModule]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async getAdminAttempts(req, res) {
        try {
            const attempts = await PsychometricAttempt_1.PsychometricAttempt.findAll({
                include: [{
                        model: User_1.User,
                        attributes: ['id', 'email', 'fullName', 'psychometricModule1Passed', 'psychometricModule2Passed']
                    }],
                order: [['createdAt', 'DESC']]
            });
            const enrichedAttempts = attempts.map(attempt => {
                let failedQuestions = [];
                const questions = attempt.module === 'module_1' ? psychometricModule1Questions_1.psychometricModule1Questions : psychometricModule2Questions_1.psychometricModule2Questions;
                if (attempt.answers && Array.isArray(attempt.answers)) {
                    attempt.answers.forEach((ans) => {
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
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ attempts: enrichedAttempts });
        }
        catch (error) {
            console.error('[PsychometricController.getAdminAttempts]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async approveAttempt(req, res) {
        try {
            const attemptId = req.params.id;
            const attempt = await PsychometricAttempt_1.PsychometricAttempt.findByPk(attemptId);
            if (!attempt) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Attempt not found' });
                return;
            }
            const user = await User_1.User.findByPk(attempt.userId);
            if (!user) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'User not found' });
                return;
            }
            if (attempt.module === 'module_1') {
                user.psychometricModule1Passed = true;
            }
            else {
                user.psychometricModule2Passed = true;
            }
            if (user.psychometricModule1Passed && user.psychometricModule2Passed) {
                user.psychometricCompletedAt = new Date();
            }
            await user.save();
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, message: 'Attempt approved and candidate profile updated.' });
        }
        catch (error) {
            console.error('[PsychometricController.approveAttempt]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async rejectAttempt(req, res) {
        try {
            const attemptId = req.params.id;
            const attempt = await PsychometricAttempt_1.PsychometricAttempt.findByPk(attemptId);
            if (!attempt) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Attempt not found' });
                return;
            }
            // Mark attempt as passed = false so they can retake tomorrow
            attempt.passed = false;
            await attempt.save();
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, message: 'Attempt rejected. Candidate will need to retake.' });
        }
        catch (error) {
            console.error('[PsychometricController.rejectAttempt]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
}
exports.PsychometricController = PsychometricController;
exports.psychometricController = new PsychometricController();
