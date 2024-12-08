import mongoose, { Schema, model, models, Document } from "mongoose";

// Define the User interface to ensure TypeScript support
interface IUser extends Document {
    name: string;
    email: string;
    image: string;
}

// Define the User schema
const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        image: { type: String, required: false }, // Profile picture (optional)
    },
    {
        collection: "users",
        timestamps: true, // Adds createdAt and updatedAt timestamps
    },
);

// Export the model, using `models` to avoid overwriting the model if already declared
const User = models.User || model<IUser>("User", userSchema);

export default User;
