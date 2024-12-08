import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { NextAuthOptions } from "next-auth";
import client from "./db";
import GoogleProvider from "next-auth/providers/google"
import mongooseConnect from "./mongoose";
import UserProfile from "@/app/models/user_profile";


// Interface for the user document in MongoDB
interface UserDocument {
    email: string;
    role?: string;
  }

//* admins list
const adminsList = ["tahanacibe@gmail.com"]

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
          })
    ],
    adapter: MongoDBAdapter(client),
    callbacks: {

        signIn: async ({ account, user }) => {
            await mongooseConnect()
            const userRef = await UserProfile.findOne({ email: user.email })
            if (user.email && (userRef.role === "admin" || userRef.role === "sub-admin" )) {
                return true
            } else {
                return "/unauthorized"
            }
        },
    }
}