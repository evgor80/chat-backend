import mongoose, { ObjectId, Schema } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { HydratedDocument } from 'mongoose';

export type RoomDocument = HydratedDocument<Room>;

export class Room {
  _id: ObjectId;
  name: string;
  slug: string;
  private: boolean;
  messages: Array<Message>;
  password: string;
  isCorrectPassword: (password: string) => Promise<boolean>;
  createdAt: Date;
}
export interface Message {
  text: string;
  type: string;
  createdAt: Date;
  author: Schema.Types.ObjectId;
}

export const RoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      min: 3,
      max: 25,
    },
    slug: {
      type: String,
      trim: true,
    },
    private: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      default: '',
    },

    messages: [
      {
        text: {
          type: String,
          required: true,
          trim: true,
        },
        type: {
          type: String,
          required: true,
        },
        author: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        createdAt: { type: Date, required: true, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

RoomSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    try {
      this.password = await bcrypt.hash(this.password, 12);
    } catch (err) {
      console.log(err);
    }
    next();
  }
});

RoomSchema.methods.isCorrectPassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};
