import mongoose, { ObjectId } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export class User {
  _id: ObjectId;
  username: string;
  password: string;
  isCorrectPassword: (password: string) => Promise<boolean>;
}

export const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      min: 3,
      max: 25,
    },

    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    try {
      this.password = await bcrypt.hash(this.password, 12);
    } catch (err) {
      console.log(err);
    }
    next();
  }
});

UserSchema.methods.isCorrectPassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};
