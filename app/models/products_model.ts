import { model, Schema, models } from "mongoose";

const ProductSchema = new Schema({
    title: { type: String, required: true },
    description: String,
    isUnlimited: Boolean,
    price: { type: Number, required: true },
    quantity: { type: Number, default: 0 },  // Default to 0 if no quantity specified
    sold: { type: Number, default: 0 },  // Default to 0 if no sales yet
    discountPrice: Number,
    isInDiscount: { type: Boolean, default: false },  // Default to false
    image: String, 
    other_images: { type: [String], default: [] },
    rating: { type: Number, min: 1, max: 5 },  // Validate rating between 1-5
    productType: { 
        type: String, 
        required: true
    },  // Example: "digital", "physical"
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],  // Category as an array
    tags: {
        type: [String],
        default: []
    },  // Optional tags for search/SEO
}, { timestamps: true });  // Automatically adds createdAt and updatedAt

// Use models.Product if it already exists, or create the model
const Product = models.Product || model("Product", ProductSchema);

export { Product };

