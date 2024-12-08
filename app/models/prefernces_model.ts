import mongoose from "mongoose";

const preferencesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Shop name is required"],
        trim: true
    },
    icon: {
        type: String,
        required: [true, "Shop icon is required"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Create model if it doesn't exist
export const Preferences = mongoose.models.Preferences || mongoose.model('Preferences', preferencesSchema);