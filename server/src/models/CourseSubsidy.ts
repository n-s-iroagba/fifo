import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class CourseSubsidy extends Model {
  public id!: string;
  public userId!: string;
  public courseId!: string;
  public amount!: number;
  public isNotified!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CourseSubsidy.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
    onDelete: 'CASCADE'
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'courses', key: 'id' },
    onDelete: 'CASCADE'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  isNotified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'CourseSubsidy',
  tableName: 'course_subsidies',
  timestamps: true,
  underscored: true,
});
