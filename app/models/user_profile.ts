import mongoose, { models } from "mongoose";

const userProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, default: 'user' },
    orders: { type: [String], default: [] },
    favoriteItems: { type: [String], default: [] },
  }, { collection: 'user_profiles' });
  
  const UserProfile = models.UserProfile || mongoose.model('UserProfile', userProfileSchema);

export default UserProfile