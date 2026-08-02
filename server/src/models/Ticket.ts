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
    declare bankName: string | null;
    declare accountNumber: string | null;
    declare accountName: string | null;
    declare refundStatus: 'none' | 'requested' | 'refunded_to_wallet' | 'refunded_to_bank';
    declare courseId: string | null;
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
    ticketSponsorshipRefundAmount: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    bankName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    accountNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    accountName: {
        type: DataTypes.STRING,
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
    }
}, {
    sequelize,
    tableName: 'tickets',
    timestamps: true,
    underscored: true,
});
