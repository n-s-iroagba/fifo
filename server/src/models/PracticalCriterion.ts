import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class PracticalCriterion extends Model {
  public id!: string;
  public courseId!: string;
  public title!: string;
  public description!: string;
  public isMandatory!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PracticalCriterion.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'courses', key: 'id' },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isMandatory: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'PracticalCriterion',
  tableName: 'practical_criteria',
  timestamps: true,
  underscored: true,
});
