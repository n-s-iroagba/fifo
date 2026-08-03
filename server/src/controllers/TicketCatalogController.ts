import { Request, Response, NextFunction } from 'express';
import { TicketCatalog } from '../models';
import { CONSTANTS } from '../constants';

export class TicketCatalogController {
    public async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const catalogs = await TicketCatalog.findAll({ order: [['name', 'ASC']] });
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

    public async updateTicketCatalog(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const ticket = await ticketCatalogService.updateTicketCatalog(id, req.body);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(ticket);
        } catch (error: any) {
            console.error('[TicketCatalogController.updateTicketCatalog]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async deleteTicketCatalog(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            await ticketCatalogService.deleteTicketCatalog(id);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ message: CONSTANTS.SUCCESS_MESSAGES.DELETED });
        } catch (error: any) {
            console.error('[TicketCatalogController.deleteTicketCatalog]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
}

export const ticketCatalogController = new TicketCatalogController();
