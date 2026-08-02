import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class ExamConfig extends Model {
  public courseId!: string;
  public passThreshold!: number;
  public timeLimitMinutes!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ExamConfig.init({
  courseId: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: { model: 'courses', key: 'id' },
    onDelete: 'CASCADE'
  },
  passThreshold: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 80
  },
  timeLimitMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30
  }
}, {
  sequelize,
  modelName: 'ExamConfig',
  tableName: 'exam_configs',
  timestamps: true,
  underscored: true,
});
