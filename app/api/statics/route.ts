import { Product } from "@/app/models/products_model";
import { authOptions } from "@/lib/authOptions";
import mongooseConnect from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

async function GET(req: NextRequest) {
  try {
    //* check if Unauthorized before getting the data
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    //* get the data
    await mongooseConnect();  // Make sure the database is connected

    const id = req.nextUrl.searchParams.get('id');
    
    if (id) {
      // Fetch products where the categories array contains the given category id
      const products = await Product.find({ categories: id }).populate('categories');

      // If no products were found
      if (products.length === 0) {
        return NextResponse.json({ message: 'No products found for the given category ID.' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Products fetched successfully', products }, { status: 200 });
    } else {
      // If no category ID is provided, fetch all products (you can modify this to filter by other criteria if needed)
      const products = await Product.find().populate('categories');

      return NextResponse.json({ message: 'Products fetched successfully', products }, { status: 200 });
    }
  } catch (error: any) {
    // If something goes wrong, return an error response
    return NextResponse.json({ error: 'Failed to fetch products', details: error.message }, { status: 500 });
  }
}

export default GET;
