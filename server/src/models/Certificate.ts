import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class Certificate extends Model {
  public id!: string;
  public userId!: string;
  public certificationTypeId!: string;
  public issueDate!: Date;
  public expiryDate!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Certificate.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  certificationTypeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'certification_types', key: 'id' },
    onDelete: 'CASCADE'
  },
  issueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Certificate',
  tableName: 'certificates',
  timestamps: true,
  underscored: true,
});
