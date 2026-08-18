import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class Receipt extends Model {
    public id!: number;
    public invoiceId!: number;
    public amountPaid!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Receipt.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    invoiceId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    amountPaid: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, {
    sequelize,
    tableName: 'receipts',
    modelName: 'Receipt',
    timestamps: true
});
