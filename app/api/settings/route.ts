import { NextRequest, NextResponse } from "next/server";
import { Preferences } from "@/app/models/prefernces_model";
import mongoose from "mongoose";

// Helper function to ensure MongoDB connection
async function ensureDbConnection() {
    if (!mongoose.connection.readyState) {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error("MongoDB URI is not defined in the environment variables.");
        }
        await mongoose.connect(mongoUri);
    }
}

// GET handler to fetch shop settings
async function GET(req: NextRequest) {
    try {
        // Ensure MongoDB is connected
        await ensureDbConnection();

        // Fetch the shop preferences - we expect only one document
        const preferences = await Preferences.findOne().lean();

        // If no preferences exist, create default ones
        if (!preferences) {
            const defaultPreferences = await Preferences.create({
                name: "Default Shop Name",
                icon: "/default-icon.png"
            });

            return NextResponse.json(
                defaultPreferences,
                { status: 200 }
            );
        }

        // Return the fetched preferences
        return NextResponse.json(
            preferences,
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error fetching shop settings:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch shop settings",
                details: error.message,
            },
            { status: 500 }
        );
    }
}

// PUT handler to update shop settings
async function PUT(req: NextRequest) {
    try {
        // Ensure MongoDB is connected
        await ensureDbConnection();

        // Parse the request body
        const { name, icon } = await req.json();
        

        // Validate required fields
        if (!name || !icon) {
            return NextResponse.json(
                {
                    error: "Invalid data. Both name and icon are required.",
                },
                { status: 400 }
            );
        }

        // Find the existing preferences document or create new one
        const updatedPreferences = await Preferences.findOneAndUpdate(
            {}, // empty filter to match any document
            {
                $set: {
                    name,
                    icon,
                    updatedAt: new Date()
                }
            },
            {
                new: true, // Return the updated document
                upsert: true, // Create a new document if none exists
                runValidators: true // Run model validations
            }
        );

        if (!updatedPreferences) {
            return NextResponse.json(
                {
                    error: "Failed to update shop settings",
                },
                { status: 500 }
            );
        }

        // Return the updated preferences
        return NextResponse.json(
            {
                message: "Shop settings updated successfully",
                settings: updatedPreferences
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error updating shop settings:", error);
        return NextResponse.json(
            {
                error: "Failed to update shop settings",
                details: error.message,
            },
            { status: 500 }
        );
    }
}

export { GET, PUT };