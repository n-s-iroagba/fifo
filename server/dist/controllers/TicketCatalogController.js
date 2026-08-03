"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketCatalogController = exports.TicketCatalogController = void 0;
const models_1 = require("../models");
const constants_1 = require("../constants");
class TicketCatalogController {
    async getAll(req, res, next) {
        try {
            const catalogs = await models_1.TicketCatalog.findAll({ order: [['name', 'ASC']] });
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
    async update(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const catalog = await models_1.TicketCatalog.findByPk(id);
            if (!catalog) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Not found' });
                return;
            }
            await catalog.update(req.body);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: catalog });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const catalog = await models_1.TicketCatalog.findByPk(id);
            if (!catalog) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Not found' });
                return;
            }
            await catalog.destroy();
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TicketCatalogController = TicketCatalogController;
exports.ticketCatalogController = new TicketCatalogController();
