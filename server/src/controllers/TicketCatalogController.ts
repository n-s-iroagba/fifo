import { Request, Response, NextFunction } from 'express';
import { TicketCatalog } from '../models';
import { CONSTANTS } from '../constants';

import { lmsSeedData } from '../data/lmsData';

export class TicketCatalogController {
    public async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            let catalogs = await TicketCatalog.findAll({ order: [['name', 'ASC']] });
            if (!catalogs || catalogs.length === 0) {
                for (const data of lmsSeedData) {
                    const code = data.course.title.split(' ')[0];
                    const name = `${data.certificationName} (${code})`;
                    await TicketCatalog.findOrCreate({
                        where: { name },
                        defaults: {
                            normalPrice: data.course.price,
                            sponsorshipPrice: data.course.price / 2,
                            description: `Australian Ticket for ${data.certificationName} (${code})`
                        }
                    });
                }
                catalogs = await TicketCatalog.findAll({ order: [['name', 'ASC']] });
            }
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: catalogs });
        } catch (error) { next(error); }
    }

    public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, normalPrice, sponsorshipPrice, description } = req.body;
            const catalog = await TicketCatalog.create({
                name, normalPrice, sponsorshipPrice, description
            });
            res.status(CONSTANTS.HTTP_STATUS.CREATED).json({ success: true, data: catalog });
        } catch (error) { next(error); }
    }

    public async updateTicketCatalog(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const catalog = await TicketCatalog.findByPk(id);
            if (!catalog) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Ticket catalog not found' });
                return;
            }
            await catalog.update(req.body);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: catalog });
        } catch (error: any) {
            console.error('[TicketCatalogController.updateTicketCatalog]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async deleteTicketCatalog(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const catalog = await TicketCatalog.findByPk(id);
            if (!catalog) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Ticket catalog not found' });
                return;
            }
            await catalog.destroy();
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, message: CONSTANTS.SUCCESS_MESSAGES.DELETED });
        } catch (error: any) {
            console.error('[TicketCatalogController.deleteTicketCatalog]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
}

export const ticketCatalogController = new TicketCatalogController();
