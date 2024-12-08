import { Product } from '@/app/models/products_model';
import { authOptions } from '@/lib/authOptions';
import mongooseConnect from '@/lib/mongoose';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

async function POST(req: NextRequest) {
  try {
    // Ensure the connection to the database is established
    await mongooseConnect();
    // Parse the request body
    const { title,
      description,
      uniteCount,
      isInDiscount,
      discountPrice,
      price,
      productType,
      quantity,
      categories,
      tags,
      other_images,
      image,
      isUnlimited, } = await req.json();
    
    // Check if required fields are provided
    if (!title || !price) {
      return NextResponse.json(
        { error: 'Title and price are required fields' },
        { status: 400 }
      );
    }

    // Create a new product document
    const productDoc = await Product.create({
      title,
      description,
      uniteCount,
      price,
      quantity,
      productType,
      discountPrice,
      isInDiscount,
      categories,
      tags,
      other_images,
      image,
      isUnlimited
    });

    // Respond with success
    return NextResponse.json(
      { message: 'Product created successfully', product: productDoc },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating product:', error); // Log the error for debugging

    // If something goes wrong, return an error response
    return NextResponse.json(
      { error: 'Failed to create product', details: error.message },
      { status: 500 }
    );
  }
}
async function PUT(req: NextRequest) {
  try {
    // Ensure the connection to the database is established
    await mongooseConnect();
    // Parse the request body
    const { title,
      description,
      uniteCount,
      price,
      productType,
      discountPrice,
      isInDiscount,
      quantity,
      categories,
      tags,
      other_images,
      id,
      image,
      isUnlimited, } = await req.json();

    // Check if required fields are provided
    if (!title || !price) {
      return NextResponse.json(
        { error: 'Title and price are required fields' },
        { status: 400 }
      );
    }

    // Create a new product document
    const productDoc = await Product.findByIdAndUpdate(id,{
      title,
      description,
      uniteCount,
      discountPrice,
      isInDiscount,
      price,
      productType,
      categories,
      quantity,
      tags,
      other_images,
      image,
      isUnlimited
    });
    // Respond with success
    return NextResponse.json(
      { message: 'Product updated successfully', product: productDoc },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error updated product:', error); // Log the error for debugging

    // If something goes wrong, return an error response
    return NextResponse.json(
      { error: 'Failed to create product', details: error.message },
      { status: 500 }
    );
  }
}


async function GET(req: NextRequest) {
  try {
    //* check if Unauthorized before getting the data
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    //* getting the actual data
    await mongooseConnect();  // Make sure the database is connected

    const id = req.nextUrl.searchParams.get('id');
    if (id) {
      const product = await Product.findById(id)
      return NextResponse.json({ message: 'Products fetched successfully', product }, { status: 200 });
    } else {
      // Fetch all products from the database
      const products = await Product.find().populate('categories');
      // Return the products in the response
      return NextResponse.json({ message: 'Products fetched successfully', products }, { status: 200 });
    }
  } catch (error: any) {
      // If something goes wrong, return an error response
      return NextResponse.json({ error: 'Failed to fetch products', details: error.message }, { status: 500 });
  }
}
async function DELETE(req: NextRequest) {
  try {
    await mongooseConnect();  // Make sure the database is connected

    const id = req.nextUrl.searchParams.get('id');
    if (id) {
      const product = await Product.findByIdAndDelete(id)
      return NextResponse.json({ message: 'Products fetched successfully', product }, { status: 200 });
    } 
  } catch (error: any) {
      // If something goes wrong, return an error response
      return NextResponse.json({ error: 'Failed to fetch products', details: error.message }, { status: 500 });
  }
}

export {POST,GET, PUT, DELETE}