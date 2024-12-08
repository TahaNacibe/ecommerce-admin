import User from "@/app/models/user";
import UserProfile from "@/app/models/user_profile";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

async function GET(req: NextRequest) {
    try {
        // Ensure MongoDB is connected
        if (!mongoose.connection.readyState) {
            const mongoUri = process.env.MONGODB_URI;
            if (!mongoUri) {
                throw new Error("MongoDB URI is not defined in the environment variables.");
            }
            await mongoose.connect(mongoUri);
        }

        // Fetch admin and sub-admin emails from UserProfile
        const adminProfiles = await UserProfile.find(
            {},
            { email: 1, role: 1 } // Only fetch email and role
        ).lean(); // .lean() for performance optimization

        // Fetch full user data from the default users collection using the emails
        const usersData = await User.find(
            {},
            { name: 1, email: 1, image: 1, _id: 1 } // Fetch relevant fields
        ).lean(); // .lean() for performance optimization

        console.log("users are", usersData);

        // Merge data: Add the role information from UserProfile to the user data
        const result = usersData.map((user: any) => {
            const profile = adminProfiles.find((p) => p.email === user.email);
            return {
                name: user.name,
                _id: user._id,
                email: user.email,
                pfp: user.image,
                role: profile?.role || "User", // Default to 'User' if no role is found
            };
        });

        // Return the fetched and merged data
        return NextResponse.json(
            {
                message: "Admin and Sub-Admin users fetched successfully",
                users: result,
            },
            { status: 200 }
        );
    } catch (error: any) {
        // Error handling
        console.error("Error occurred while fetching users:", error); // Add logging for debugging
        return NextResponse.json(
            {
                error: "Failed to fetch users",
                details: error.message, // Include the error message for debugging
            },
            { status: 500 }
        );
    }
}

export { GET };
