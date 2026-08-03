import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class ExamAttempt extends Model {
  public id!: string;
  public userId!: string;
  public courseId!: string;
  public score!: number;
  public isPass!: boolean;
  public attemptNumber!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ExamAttempt.init({
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
  courseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'courses', key: 'id' },
    onDelete: 'CASCADE'
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  isPass: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  attemptNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  sequelize,
  modelName: 'ExamAttempt',
  tableName: 'exam_attempts',
  timestamps: true,
  underscored: true,
});
