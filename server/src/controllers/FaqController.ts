import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Faq } from '../models';
import { CONSTANTS } from '../constants';
import { logger } from '../utils/logger';

function isValidUrl(string: string): boolean {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

export class FaqController {
    /**
     * Get all FAQs.
     * Public / Candidates / Admin.
     * Returns the list and a keyed slots object ({ process, payment }).
     */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const faqs = await Faq.findAll({
                order: [['type', 'ASC']],
            });

            const processFaq = faqs.find((f) => f.type === 'process') || null;
            const paymentFaq = faqs.find((f) => f.type === 'payment') || null;

            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                data: faqs,
                slots: {
                    process: processFaq,
                    payment: paymentFaq,
                },
                count: faqs.length,
            });
        } catch (error: any) {
            logger.error('Failed to fetch FAQs:', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: 'Failed to retrieve FAQs',
            });
        }
    }

    /**
     * Get single FAQ by ID.
     */
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const faq = await Faq.findByPk(Number(id));

            if (!faq) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
                    error: 'FAQ link not found',
                });
                return;
            }

            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                data: faq,
            });
        } catch (error: any) {
            logger.error('Failed to fetch FAQ by ID:', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: 'Failed to retrieve FAQ',
            });
        }
    }

    /**
     * Create FAQ.
     * Enforces:
     * 1. Only 'process' or 'payment' type.
     * 2. Exactly one FAQ per type.
     * 3. At most 2 FAQ records in total.
     */
    async create(req: Request, res: Response): Promise<void> {
        try {
            const { type, link, title, description } = req.body;

            // Validate type
            if (!type || !['process', 'payment'].includes(type)) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    error: "Invalid type. FAQ type must be either 'process' or 'payment'.",
                });
                return;
            }

            // Validate link
            if (!link || typeof link !== 'string' || !isValidUrl(link.trim())) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    error: 'A valid URL starting with http:// or https:// is required for the AI chat link.',
                });
                return;
            }

            // Check total count
            const totalCount = await Faq.count();
            if (totalCount >= 2) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    error: 'Maximum 2 FAQ links allowed in database (one for process and one for payment). Please update or delete an existing FAQ.',
                });
                return;
            }

            // Check if FAQ for this type already exists
            const existing = await Faq.findOne({ where: { type } });
            if (existing) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    error: `An FAQ link for '${type}' already exists. Only one link is allowed for ${type}. Please edit or delete the existing record.`,
                });
                return;
            }

            const defaultTitle = type === 'process' ? 'Process AI Assistant' : 'Payment AI Assistant';

            const faq = await Faq.create({
                type,
                link: link.trim(),
                title: title?.trim() || defaultTitle,
                description: description?.trim() || null,
            });

            logger.info(`[FaqController] Created FAQ [id=${faq.id}, type=${faq.type}]`);

            res.status(CONSTANTS.HTTP_STATUS.CREATED).json({
                success: true,
                message: `FAQ link for ${type} created successfully`,
                data: faq,
            });
        } catch (error: any) {
            logger.error('Failed to create FAQ:', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: error.message || 'Failed to create FAQ',
            });
        }
    }

    /**
     * Update FAQ by ID.
     */
    async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { type, link, title, description } = req.body;

            const faq = await Faq.findByPk(Number(id));
            if (!faq) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
                    error: 'FAQ link not found',
                });
                return;
            }

            // If updating type, validate and ensure uniqueness
            if (type !== undefined) {
                if (!['process', 'payment'].includes(type)) {
                    res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                        error: "Invalid type. FAQ type must be either 'process' or 'payment'.",
                    });
                    return;
                }

                if (type !== faq.type) {
                    const duplicate = await Faq.findOne({
                        where: {
                            type,
                            id: { [Op.ne]: faq.id },
                        },
                    });

                    if (duplicate) {
                        res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                            error: `An FAQ link for '${type}' already exists. Only one FAQ per type is allowed.`,
                        });
                        return;
                    }
                    faq.type = type;
                }
            }

            // If updating link, validate URL
            if (link !== undefined) {
                if (!link || typeof link !== 'string' || !isValidUrl(link.trim())) {
                    res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                        error: 'A valid URL starting with http:// or https:// is required for the AI chat link.',
                    });
                    return;
                }
                faq.link = link.trim();
            }

            if (title !== undefined) {
                faq.title = title ? title.trim() : null;
            }

            if (description !== undefined) {
                faq.description = description ? description.trim() : null;
            }

            await faq.save();
            logger.info(`[FaqController] Updated FAQ [id=${faq.id}, type=${faq.type}]`);

            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                message: 'FAQ link updated successfully',
                data: faq,
            });
        } catch (error: any) {
            logger.error('Failed to update FAQ:', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: error.message || 'Failed to update FAQ',
            });
        }
    }

    /**
     * Delete FAQ by ID.
     */
    async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const faq = await Faq.findByPk(Number(id));

            if (!faq) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
                    error: 'FAQ link not found',
                });
                return;
            }

            const deletedType = faq.type;
            await faq.destroy();
            logger.info(`[FaqController] Deleted FAQ [id=${id}, type=${deletedType}]`);

            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                message: `FAQ link for ${deletedType} deleted successfully`,
            });
        } catch (error: any) {
            logger.error('Failed to delete FAQ:', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: 'Failed to delete FAQ',
            });
        }
    }

    /**
     * Upsert FAQ by type.
     * Directly creates or updates the single record for the given type ('process' | 'payment').
     */
    async upsert(req: Request, res: Response): Promise<void> {
        try {
            const { type, link, title, description } = req.body;

            if (!type || !['process', 'payment'].includes(type)) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    error: "Invalid type. FAQ type must be either 'process' or 'payment'.",
                });
                return;
            }

            if (!link || typeof link !== 'string' || !isValidUrl(link.trim())) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    error: 'A valid URL starting with http:// or https:// is required for the AI chat link.',
                });
                return;
            }

            const defaultTitle = type === 'process' ? 'Process AI Assistant' : 'Payment AI Assistant';

            let faq = await Faq.findOne({ where: { type } });

            if (faq) {
                faq.link = link.trim();
                if (title !== undefined) faq.title = title ? title.trim() : defaultTitle;
                if (description !== undefined) faq.description = description ? description.trim() : null;
                await faq.save();
                logger.info(`[FaqController] Upsert (updated) FAQ [id=${faq.id}, type=${faq.type}]`);
            } else {
                // Check if total count already has 2 records
                const totalCount = await Faq.count();
                if (totalCount >= 2) {
                    res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                        error: 'Maximum 2 FAQ links allowed in database. Please delete an existing FAQ first.',
                    });
                    return;
                }

                faq = await Faq.create({
                    type,
                    link: link.trim(),
                    title: title?.trim() || defaultTitle,
                    description: description?.trim() || null,
                });
                logger.info(`[FaqController] Upsert (created) FAQ [id=${faq.id}, type=${faq.type}]`);
            }

            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                message: `FAQ link for ${type} saved successfully`,
                data: faq,
            });
        } catch (error: any) {
            logger.error('Failed to upsert FAQ:', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: error.message || 'Failed to save FAQ',
            });
        }
    }
}

export const faqController = new FaqController();
