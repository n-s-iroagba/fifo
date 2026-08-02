import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class CertificationType extends Model {
  public id!: string;
  public name!: string;
  public code!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CertificationType.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  sequelize,
  modelName: 'CertificationType',
  tableName: 'certification_types',
  timestamps: true,
  underscored: true,
});
