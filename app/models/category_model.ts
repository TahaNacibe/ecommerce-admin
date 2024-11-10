import mongoose, { model, Schema, models } from "mongoose";

const CategorySchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    usedCount: {type:Number, default:0},
    parentFor: {type:Number, default:0},
    parent : {type: mongoose.Types.ObjectId, ref:"Category"}
});

export const Category = models.Category || model("Category", CategorySchema);
