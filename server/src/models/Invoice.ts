import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class Invoice extends Model {
    public id!: number;
    public applicantId!: number;
    public purpose!: string;
    public amountInUSD!: number;
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
        allowNull: false
    },
    purpose: {
        type: DataTypes.ENUM('aveling-partial', 'aveling-complete-after-partial', 'aveling-complete', 'second-attempt', 'shipping'),
        allowNull: false
    },
    amountInUSD: {
        type: DataTypes.FLOAT,
        allowNull: false
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
