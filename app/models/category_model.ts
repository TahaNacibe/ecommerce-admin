import mongoose, { model, Schema, models } from "mongoose";

const CategorySchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    usedCount: {type:Number, default:0},
    parentFor: {type:Number, default:0},
    parent: { type: mongoose.Types.ObjectId, ref: "Category" },
    properties: [
        { 
          key: { type: String, required: true },  // Property key (e.g., 'color', 'size')
          values: { type: Array<String>, required: true }  // Property value (e.g., 'red', 'M')
        }
      ] 
});

export const Category = models.Category || model("Category", CategorySchema);
