import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class CertificationGap extends Model {
  public id!: string;
  public userId!: string;
  public certificationTypeId!: string;
  public status!: 'Missing' | 'Expired' | 'Valid';
  public assignedByAdminId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CertificationGap.init({
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
  status: {
    type: DataTypes.ENUM('Missing', 'Expired', 'Valid'),
    allowNull: false,
    defaultValue: 'Missing'
  },
  assignedByAdminId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  }
}, {
  sequelize,
  modelName: 'CertificationGap',
  tableName: 'certification_gaps',
  timestamps: true,
  underscored: true,
});
