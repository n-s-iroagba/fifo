import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class Course extends Model {
  public id!: string;
  public title!: string;
  public code!: string;
  public description!: string;
  public format!: 'Theory' | 'Practical' | 'Mixed' | 'Online';
  public certificationTypeId!: string;
  public price!: number;
  public capacity!: number;
  public isPublished!: boolean;
  public contentUrl!: string | null;
  public syllabus!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Course.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  contentUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  syllabus: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  format: {
    type: DataTypes.ENUM('Theory', 'Practical', 'Mixed', 'Online'),
    allowNull: false
  },
  certificationTypeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'certification_types', key: 'id' }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'Course',
  tableName: 'courses',
  timestamps: true,
  underscored: true,
});
