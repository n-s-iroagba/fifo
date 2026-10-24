import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class Invoice extends Model {
    public id!: number;
    public applicantId!: number;
    public purpose!: string;
    public amountInUSD!: number;
    public amountInAUD!: number;
    public paymentStatus!: 'unpaid' | 'half_paid' | 'paid';
    public walletAddress!: string | null;
    public date!: Date;
    public receiptProofSubmission!: Date | null;
    public isPaid!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Invoice.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    applicantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    purpose: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'CertHero Ticket Sponsorship'
    },
    paymentStatus: {
        type: DataTypes.ENUM('unpaid', 'half_paid', 'paid'),
        allowNull: false,
        defaultValue: 'unpaid'
    },
    walletAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    amountInAUD: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0
    },
    amountInUSD: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    receiptProofSubmission: {
        type: DataTypes.DATE,
        allowNull: true
    },
    isPaid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize,
    tableName: 'invoices',
    modelName: 'Invoice',
    timestamps: true
});
