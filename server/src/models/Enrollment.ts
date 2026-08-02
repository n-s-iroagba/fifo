import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class Enrollment extends Model {
  public id!: string;
  public userId!: string;
  public courseId!: string;
  public status!: 'Pending' | 'Active' | 'Review-Awaiting' | 'Completed' | 'Failed';
  public paymentStatus!: 'Unpaid' | 'Paid';
  public theoryProgress!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Enrollment.init({
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
  status: {
    type: DataTypes.ENUM('Pending', 'Active', 'Review-Awaiting', 'Completed', 'Failed'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  paymentStatus: {
    type: DataTypes.ENUM('Unpaid', 'Paid'),
    allowNull: false,
    defaultValue: 'Unpaid'
  },
  theoryProgress: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'Enrollment',
  tableName: 'enrollments',
  timestamps: true,
  underscored: true,
});
