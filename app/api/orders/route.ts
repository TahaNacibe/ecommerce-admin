
import { Order } from "@/app/models/order_model";
import mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

async function GET(req: NextRequest) {
    try {
        // Connect to MongoDB only once
        if (!mongoose.connection.readyState) {
            await mongoose.connect(process.env.MONGODB_URI!);
        }
            // Get orders from the order collection
            const orders = await Order.find({}, null, { sort: { "updatedAt": 1 } });
            
            return NextResponse.json({ message: 'Products fetched successfully', orders }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch products', details: error.message }, { status: 500 });
    }
}

export  {GET};
