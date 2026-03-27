import { InferSchemaType, Model, Schema, model, models } from 'mongoose';

const fuelEntrySchema = new Schema(
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
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    fuelType: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    notes: {
      type: String,
      default: null,
      trim: true
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

export type FuelEntryDocument = InferSchemaType<typeof fuelEntrySchema>;
export const FuelEntryModel =
  (models.FuelEntry as Model<FuelEntryDocument>) || model('FuelEntry', fuelEntrySchema);
