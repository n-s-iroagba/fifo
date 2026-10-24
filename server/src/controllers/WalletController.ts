import { Request, Response } from 'express';
import { Wallet } from '../models';
import { CONSTANTS } from '../constants';
import { logger } from '../utils/logger';

export class WalletController {
    /**
     * Get single active USDT TRC20 wallet (Public & Admin)
     */
    async getWallet(req: Request, res: Response): Promise<void> {
        try {
            let wallet = await Wallet.findOne({ where: { isActive: true } });
            if (!wallet) {
                wallet = await Wallet.findOne({ order: [['createdAt', 'DESC']] });
            }
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: wallet || null });
        } catch (error: any) {
            logger.error('[WalletController.getWallet]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Failed to fetch wallet' });
        }
    }

    /**
     * Set or update the single wallet in the database
     */
    async setWallet(req: Request, res: Response): Promise<void> {
        try {
            const { address, network, qrCodeUrl } = req.body;
            if (!address || !address.trim()) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: 'Wallet address is required' });
                return;
            }

            const cleanAddress = address.trim();
            const walletNetwork = network?.trim() || 'USDT TRON (TRC20)';

            // Enforce only one wallet in DB: find existing or create
            let wallet = await Wallet.findOne({ order: [['createdAt', 'DESC']] });
            if (wallet) {
                wallet.address = cleanAddress;
                wallet.network = walletNetwork;
                if (qrCodeUrl !== undefined) wallet.qrCodeUrl = qrCodeUrl;
                wallet.isActive = true;
                await wallet.save();
            } else {
                wallet = await Wallet.create({
                    address: cleanAddress,
                    network: walletNetwork,
                    qrCodeUrl: qrCodeUrl || null,
                    isActive: true,
                });
            }

            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                message: 'USDT TRC20 Wallet configured successfully',
                data: wallet
            });
        } catch (error: any) {
            logger.error('[WalletController.setWallet]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Failed to configure wallet' });
        }
    }

    /**
     * Delete / Reset wallet
     */
    async deleteWallet(req: Request, res: Response): Promise<void> {
        try {
            await Wallet.destroy({ where: {} });
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, message: 'Wallet removed' });
        } catch (error: any) {
            logger.error('[WalletController.deleteWallet]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Failed to delete wallet' });
        }
    }
}

export const walletController = new WalletController();
