import { InferSchemaType, Model, Schema, model, models } from 'mongoose';

const reminderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true
    },
    reminderText: {
      type: String,
      required: true,
      trim: true
    },
    currentOdometerKm: {
      type: Number,
      required: true,
      min: 0
    },
    mileageIntervalKm: {
      type: Number,
      default: null,
      min: 0
    },
    remindAtOdometerKm: {
      type: Number,
      default: null,
      min: 0
    },
    monthInterval: {
      type: Number,
      default: null,
      min: 0
    },
    remindAtDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      required: true,
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

export type ReminderDocument = InferSchemaType<typeof reminderSchema>;
export const ReminderModel =
  (models.Reminder as Model<ReminderDocument>) || model('Reminder', reminderSchema);
