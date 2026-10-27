"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveWalletAddress = getActiveWalletAddress;
exports.generateQrDataUrl = generateQrDataUrl;
exports.generateWalletQrDataUrl = generateWalletQrDataUrl;
const qrcode_1 = __importDefault(require("qrcode"));
const models_1 = require("../models");
async function getActiveWalletAddress() {
    try {
        let wallet = await models_1.Wallet.findOne({ where: { isActive: true } });
        if (!wallet) {
            wallet = await models_1.Wallet.findOne({ order: [['createdAt', 'DESC']] });
        }
        return wallet?.address || 'TX7k9VwE3nQ9LmPzR4tY2uA1sD5fG8hJ0k';
    }
    catch {
        return 'TX7k9VwE3nQ9LmPzR4tY2uA1sD5fG8hJ0k';
    }
}
async function generateQrDataUrl(text) {
    try {
        return await qrcode_1.default.toDataURL(text, {
            width: 280,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
    }
    catch (err) {
        console.error('[CryptoQr] Failed to generate QR code data URL:', err);
        return '';
    }
}
async function generateWalletQrDataUrl(walletAddress) {
    const address = walletAddress || await getActiveWalletAddress();
    return generateQrDataUrl(address);
}
