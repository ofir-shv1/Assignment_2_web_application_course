import mongoose, { Schema } from 'mongoose';
import { IPost } from './modelTypes';

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    sender: { type: String, required: true },
    comments: {type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }], default: [],}
  },
);

export default mongoose.model<IPost>('Post', postSchema);