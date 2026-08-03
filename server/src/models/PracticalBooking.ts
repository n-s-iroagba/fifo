import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class PracticalBooking extends Model {
  public id!: string;
  public sessionId!: string;
  public userId!: string;
  public attendanceStatus!: 'Booked' | 'Attended' | 'NoShow';
  public passStatus!: 'Pending' | 'Pass' | 'Fail';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PracticalBooking.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  sessionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'practical_sessions', key: 'id' },
    onDelete: 'CASCADE'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  attendanceStatus: {
    type: DataTypes.ENUM('Booked', 'Attended', 'NoShow'),
    defaultValue: 'Booked'
  },
  passStatus: {
    type: DataTypes.ENUM('Pending', 'Pass', 'Fail'),
    defaultValue: 'Pending'
  }
}, {
  sequelize,
  modelName: 'PracticalBooking',
  tableName: 'practical_bookings',
  timestamps: true,
  underscored: true,
});
