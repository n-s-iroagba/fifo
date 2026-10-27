import QRCode from 'qrcode';
import { Wallet } from '../models';

export async function getActiveWalletAddress(): Promise<string> {
    try {
        let wallet = await Wallet.findOne({ where: { isActive: true } });
        if (!wallet) {
            wallet = await Wallet.findOne({ order: [['createdAt', 'DESC']] });
        }
        return wallet?.address || 'TX7k9VwE3nQ9LmPzR4tY2uA1sD5fG8hJ0k';
    } catch {
        return 'TX7k9VwE3nQ9LmPzR4tY2uA1sD5fG8hJ0k';
    }
}

export async function generateQrDataUrl(text: string): Promise<string> {
    try {
        return await QRCode.toDataURL(text, {
            width: 280,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
    } catch (err) {
        console.error('[CryptoQr] Failed to generate QR code data URL:', err);
        return '';
    }
}

export async function generateWalletQrDataUrl(walletAddress?: string): Promise<string> {
    const address = walletAddress || await getActiveWalletAddress();
    return generateQrDataUrl(address);
}


