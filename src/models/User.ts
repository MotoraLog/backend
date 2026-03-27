import { InferSchemaType, Model, Schema, model, models } from 'mongoose';

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export type UserDocument = InferSchemaType<typeof userSchema>;
export const UserModel = (models.User as Model<UserDocument>) || model('User', userSchema);
