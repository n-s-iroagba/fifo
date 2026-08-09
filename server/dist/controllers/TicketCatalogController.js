"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketCatalogController = exports.TicketCatalogController = void 0;
const models_1 = require("../models");
const constants_1 = require("../constants");
const lmsData_1 = require("../data/lmsData");
class TicketCatalogController {
    async getAll(req, res, next) {
        try {
            let catalogs = await models_1.TicketCatalog.findAll({ order: [['name', 'ASC']] });
            if (!catalogs || catalogs.length === 0) {
                for (const data of lmsData_1.lmsSeedData) {
                    const code = data.course.title.split(' ')[0];
                    const name = `${data.certificationName} (${code})`;
                    await models_1.TicketCatalog.findOrCreate({
                        where: { name },
                        defaults: {
                            normalPrice: data.course.price,
                            sponsorshipPrice: data.course.price / 2,
                            description: `Australian Ticket for ${data.certificationName} (${code})`
                        }
                    });
                }
                catalogs = await models_1.TicketCatalog.findAll({ order: [['name', 'ASC']] });
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: catalogs });
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const { name, normalPrice, sponsorshipPrice, description } = req.body;
            const catalog = await models_1.TicketCatalog.create({
                name, normalPrice, sponsorshipPrice, description
            });
            res.status(constants_1.CONSTANTS.HTTP_STATUS.CREATED).json({ success: true, data: catalog });
        }
        catch (error) {
            next(error);
        }
    }
    async updateTicketCatalog(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const catalog = await models_1.TicketCatalog.findByPk(id);
            if (!catalog) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Ticket catalog not found' });
                return;
            }
            await catalog.update(req.body);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: catalog });
        }
        catch (error) {
            console.error('[TicketCatalogController.updateTicketCatalog]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async deleteTicketCatalog(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const catalog = await models_1.TicketCatalog.findByPk(id);
            if (!catalog) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Ticket catalog not found' });
                return;
            }
            await catalog.destroy();
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, message: constants_1.CONSTANTS.SUCCESS_MESSAGES.DELETED });
        }
        catch (error) {
            console.error('[TicketCatalogController.deleteTicketCatalog]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
}
exports.TicketCatalogController = TicketCatalogController;
exports.ticketCatalogController = new TicketCatalogController();
