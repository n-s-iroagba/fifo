import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class ExamQuestion extends Model {
  public id!: string;
  public courseId!: string;
  public questionText!: string;
  public questionType!: 'mcq' | 'essay' | 'input_answer';
  public options!: string[] | null;
  public correctOptionIndex!: number | null;
  public correctAnswer!: string | null;
  public weight!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ExamQuestion.init({
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
  questionText: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  questionType: {
    type: DataTypes.ENUM('mcq', 'essay', 'input_answer'),
    allowNull: false,
    defaultValue: 'mcq'
  },
  options: {
    type: DataTypes.JSON,
    allowNull: true
  },
  correctOptionIndex: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  correctAnswer: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  weight: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  }
}, {
  sequelize,
  modelName: 'ExamQuestion',
  tableName: 'exam_questions',
  timestamps: true,
  underscored: true,
});
