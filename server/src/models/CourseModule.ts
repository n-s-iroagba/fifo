import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class CourseModule extends Model {
  public id!: string;
  public courseId!: string;
  public title!: string;
  public contentType!: 'VIDEO' | 'DOCUMENT' | 'TEXT';
  public contentUrl!: string;
  public content!: string | null;
  public durationMinutes!: number;
  public sequenceOrder!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CourseModule.init({
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
  contentType: {
    type: DataTypes.ENUM('VIDEO', 'DOCUMENT', 'TEXT'),
    allowNull: false
  },
  contentUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 30
  },
  sequenceOrder: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'CourseModule',
  tableName: 'course_modules',
  timestamps: true,
  underscored: true,
});
