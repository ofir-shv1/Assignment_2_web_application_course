import mongoose, { Schema } from 'mongoose';
import { IComment } from './modelTypes';

const commentSchema = new Schema<IComment>(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, required: true },
    content: { type: String, required: true },
    sender: { type: String, required: true }
  },
);

export default mongoose.model<IComment>('Comment', commentSchema);