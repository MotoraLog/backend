import { InferSchemaType, Model, Schema, model, models } from 'mongoose';

const vehicleSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    plate: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    category: {
      type: String,
      required: true,
      default: 'car',
      trim: true
    },
    currentOdometerKm: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

vehicleSchema.index({ userId: 1, plate: 1 }, { unique: true });

export type VehicleDocument = InferSchemaType<typeof vehicleSchema>;
export const VehicleModel =
  (models.Vehicle as Model<VehicleDocument>) || model('Vehicle', vehicleSchema);
