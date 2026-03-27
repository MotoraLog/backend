import { InferSchemaType, Model, Schema, model, models } from 'mongoose';

const maintenanceEntrySchema = new Schema(
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
    maintenanceType: {
      type: String,
      required: true,
      trim: true
    },
    performedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    odometerKm: {
      type: Number,
      required: true,
      min: 0
    },
    notes: {
      type: String,
      default: null,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export type MaintenanceEntryDocument = InferSchemaType<typeof maintenanceEntrySchema>;
export const MaintenanceEntryModel =
  (models.MaintenanceEntry as Model<MaintenanceEntryDocument>) ||
  model('MaintenanceEntry', maintenanceEntrySchema);
