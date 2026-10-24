"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletController = exports.WalletController = void 0;
const models_1 = require("../models");
const constants_1 = require("../constants");
const logger_1 = require("../utils/logger");
class WalletController {
    /**
     * Get single active USDT TRC20 wallet (Public & Admin)
     */
    async getWallet(req, res) {
        try {
            let wallet = await models_1.Wallet.findOne({ where: { isActive: true } });
            if (!wallet) {
                wallet = await models_1.Wallet.findOne({ order: [['createdAt', 'DESC']] });
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: wallet || null });
        }
        catch (error) {
            logger_1.logger.error('[WalletController.getWallet]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Failed to fetch wallet' });
        }
    }
    /**
     * Set or update the single wallet in the database
     */
    async setWallet(req, res) {
        try {
            const { address, network, qrCodeUrl } = req.body;
            if (!address || !address.trim()) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: 'Wallet address is required' });
                return;
            }
            const cleanAddress = address.trim();
            const walletNetwork = network?.trim() || 'USDT TRON (TRC20)';
            // Enforce only one wallet in DB: find existing or create
            let wallet = await models_1.Wallet.findOne({ order: [['createdAt', 'DESC']] });
            if (wallet) {
                wallet.address = cleanAddress;
                wallet.network = walletNetwork;
                if (qrCodeUrl !== undefined)
                    wallet.qrCodeUrl = qrCodeUrl;
                wallet.isActive = true;
                await wallet.save();
            }
            else {
                wallet = await models_1.Wallet.create({
                    address: cleanAddress,
                    network: walletNetwork,
                    qrCodeUrl: qrCodeUrl || null,
                    isActive: true,
                });
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                message: 'USDT TRC20 Wallet configured successfully',
                data: wallet
            });
        }
        catch (error) {
            logger_1.logger.error('[WalletController.setWallet]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Failed to configure wallet' });
        }
    }
    /**
     * Delete / Reset wallet
     */
    async deleteWallet(req, res) {
        try {
            await models_1.Wallet.destroy({ where: {} });
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, message: 'Wallet removed' });
        }
        catch (error) {
            logger_1.logger.error('[WalletController.deleteWallet]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Failed to delete wallet' });
        }
    }
}
exports.WalletController = WalletController;
exports.walletController = new WalletController();
