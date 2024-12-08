import UserProfile from "@/app/models/user_profile"; // Import the UserProfile model
import User from "@/app/models/user";
import mongoose from "mongoose"; // Import mongoose for database connection
import { NextRequest, NextResponse } from "next/server"; // Import Next.js request/response handlers
import { NextApiRequest } from "next";

// GET handler to fetch admin and sub-admin user details
async function GET(req: NextRequest) {
    try {
        // Ensure MongoDB is connected
        if (!mongoose.connection.readyState) {
            await mongoose.connect(process.env.MONGODB_URI!, );
        }

        // Fetch admin and sub-admin emails from UserProfile
        const adminProfiles = await UserProfile.find(
            { role: { $in: ["admin", "sub-admin"] } }, // Filter for admin and sub-admin roles
            { email: 1, role: 1, _id: 0 } // Only fetch email and role
        ).lean();

        // Extract emails from adminProfiles
        const adminEmails = adminProfiles.map(profile => {
            return profile.email
        });
        // Fetch full user data from the default users collection using the emails
        const usersData = await User.find(
            { email: { $in: adminEmails } }, // Match emails
            { name: 1, email: 1, image: 1 } // Fetch relevant fields
        );


        // Merge data: Add the role information from UserProfile to the user data
        const result = usersData.map((user : any) => {
            const profile = adminProfiles.find(p => p.email === user.email);
            return {
                name: user.name,
                email: user.email,
                pfp: user.image,
                role: profile?.role, // Add role from UserProfile
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
        return NextResponse.json(
            {
                error: "Failed to fetch users",
                details: error.message, // Include the error message for debugging
            },
            { status: 500 }
        );
    }
}
async function PUT(req: NextRequest, res: any) {
    if (req.method !== "PUT") {
      // If it's not a PUT request, return a 405 Method Not Allowed
      return res.status(405).json({ message: "Method Not Allowed" });
    }
  
    const  role  = req.nextUrl.searchParams.get("role"); // Get the role from the request body
    const  email  = req.nextUrl.searchParams.get("email"); // Get the role from the request body
  
    try {
      // Ensure MongoDB is connected
      if (!mongoose.connection.readyState) {
        await mongoose.connect(process.env.MONGODB_URI!);
      }
  
  
      // Find the user by email and update the role
      const updatedUser = await UserProfile.findOneAndUpdate(
        { email: email }, // Match the user by email
        { $set: { role: role } }, // Update the role field
        { new: true } // Return the updated document
      );
  
      if (!updatedUser) {
        return NextResponse.json(
            {
                error: "Failed to fetch users",
                details: "not found", // Include the error message for debugging
            },
            { status: 500 }
        );
      }
  
      // Respond with the updated user
      return NextResponse.json(
        {
            message: "user state changed",
            users: updatedUser,
        },
        { status: 200 }
    );
    } catch (error: any) {
      // Handle any errors during the process
      return NextResponse.json(
        {
            error: "Failed to switch users",
            details: error.message, // Include the error message for debugging
        },
        { status: 500 }
    );
    }
  }



export { GET, PUT };
