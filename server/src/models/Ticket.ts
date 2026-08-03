import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Ticket extends Model {
    declare id: number;
    declare userId: number;
    declare applicationId: number | null;
    declare status: 'not_possessed' | 'possessed';
    declare ticketNumber: string | null;
    declare ticketType: string;
    declare description: string | null;
    declare purchasePrice: number;
    declare purchaseDate: Date | null;
    declare expiryDate: Date | null;
    declare proof: string | null;
    declare proofThumbnail: string | null;
    declare sponsorshipDeadline: Date | null;
    declare ticketSponsorship: 
        | 'no_application'
        | 'applied'
        | 'first_attempt_approved'
        | 'first_attempt_failed'
        | 'second_attempt_approved'
        | 'second_attempt_failed'
        | 'ticket_issued';
    declare ticketSponsorshipRefundAmount: number | null;
    declare refundStatus: 'none' | 'requested' | 'refunded_to_wallet' | 'refunded_to_bank';
    declare courseId: string | null;
    declare canApplySponsorship: boolean;
    declare realPrice: number | null;
    declare subsidisedPrice: number | null;
    declare receiptUrl: string | null;
    declare receiptReference: string | null;
    declare paymentStatus: 'unpaid' | 'receipt_submitted' | 'payment_verified';
    declare courseAccessGranted: boolean;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;

    // Associations
    declare User?: any;
    declare Application?: any;
}

Ticket.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    applicationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('not_possessed', 'possessed'),
        defaultValue: 'not_possessed',
        allowNull: false,
    },
    ticketNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    ticketType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    purchasePrice: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    realPrice: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    subsidisedPrice: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    purchaseDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    expiryDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    proof: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    proofThumbnail: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    sponsorshipDeadline: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    ticketSponsorship: {
        type: DataTypes.ENUM(
            'no_application',
            'applied',
            'first_attempt_approved',
            'first_attempt_failed',
            'second_attempt_approved',
            'second_attempt_failed',
            'ticket_issued'
        ),
        defaultValue: 'no_application',
        allowNull: false,
    },
    canApplySponsorship: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    ticketSponsorshipRefundAmount: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    refundStatus: {
        type: DataTypes.ENUM('none', 'requested', 'refunded_to_wallet', 'refunded_to_bank'),
        defaultValue: 'none',
        allowNull: false,
    },
    courseId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    receiptUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    receiptReference: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    paymentStatus: {
        type: DataTypes.ENUM('unpaid', 'receipt_submitted', 'payment_verified'),
        defaultValue: 'unpaid',
        allowNull: false,
    },
    courseAccessGranted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
}, {
    sequelize,
    tableName: 'tickets',
    timestamps: true,
    underscored: true,
});
