import mongoose, { Schema } from 'mongoose';
import { IPost } from './modelTypes';

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comments: {type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }], default: [],}
  },
  { timestamps: true }
);

export default mongoose.model<IPost>('Post', postSchema);