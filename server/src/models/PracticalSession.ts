import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class PracticalSession extends Model {
  public id!: string;
  public courseId!: string;
  public instructorId!: string;
  public startTime!: Date;
  public endTime!: Date;
  public capacity!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PracticalSession.init({
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
  instructorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'PracticalSession',
  tableName: 'practical_sessions',
  timestamps: true,
  underscored: true,
});
