import { InferSchemaType, Model, Schema, model, models } from 'mongoose';

const odometerUpdateSchema = new Schema(
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
    odometerKm: {
      type: Number,
      required: true,
      min: 0
    },
    recordedAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export type OdometerUpdateDocument = InferSchemaType<typeof odometerUpdateSchema>;
export const OdometerUpdateModel =
  (models.OdometerUpdate as Model<OdometerUpdateDocument>) ||
  model('OdometerUpdate', odometerUpdateSchema);
