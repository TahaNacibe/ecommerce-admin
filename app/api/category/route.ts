import { Category } from '@/app/models/category_model';
import { authOptions } from '@/lib/authOptions';
import mongooseConnect from '@/lib/mongoose';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';


// Helper function for error handling
const handleError = (error: unknown, message: string) => {
  console.error(`${message}:`, error);
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  return NextResponse.json(
    { error: message, details: errorMessage },
    { status: 500 }
  );
};

// GET all categories, ordered by usedCount
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await mongooseConnect();
    const categories = await Category.find({})
      .sort({ usedCount: -1, name: 1 }); // Sort by usedCount (descending), then by name (ascending)
    return NextResponse.json({ data: categories }, { status: 200 });
  } catch (error) {
    return handleError(error, 'Failed to fetch categories');
  }
}

// POST new category
export async function POST(req: NextRequest) {
  try {
    await mongooseConnect();
    
    const body = await req.json();
    const { name, description, parent, parentFor, properties } = body;
    console.log(`name: ${name}, description: ${description}, parent: ${parent}, parentFor: ${parentFor}, properties ${JSON.stringify(properties)}`)
    
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check for duplicate category
    const existingCategory = await Category.findOne({ name }).populate("parent");
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 409 }
      );
    }

    //* update the counter for the parent
    const updatedCategory = await Category.findByIdAndUpdate(
      parent,
      { parentFor: (parentFor || 0) +1  },
      { new: true, runValidators: true }
    );
    
    const newCategory = await Category.create({
      name,
      description,
      parent,
      properties,
      parentFor: parentFor || 0,  // Default to 0 if not provided
      usedCount: 0,                // Initialize usedCount as 0
    });
    
    return NextResponse.json({
      message: 'Category created successfully',
      data: newCategory
    }, { status: 201 });
  } catch (error) {
    return handleError(error, 'Failed to create category');
  }
}

// PUT (update) category
export async function PUT(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    await mongooseConnect();
    
    const { name, description, parent,properties } = await req.json();
    
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check for duplicate category
    const existingCategory = await Category.findOne({
      name,
      _id: { $ne: id }
    }).populate("parent");
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 409 }
      );
    }
    
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, parent, description,properties },
      { new: true, runValidators: true }
    );
    
    if (!updatedCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Category updated successfully',
      data: updatedCategory
    }, { status: 200 });
  } catch (error) {
    return handleError(error, 'Failed to update category');
  }
}

// DELETE category (only if usedCount is 0)
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    
    // Ensure the category is not in use (usedCount > 0)
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    if (category.usedCount > 0) {
      return NextResponse.json(
        { error: 'Category is in use and cannot be deleted' },
        { status: 400 }
      );
    }
    
    // Delete the category if it's not in use
    const deletedCategory = await Category.findByIdAndDelete(id);
    
    return NextResponse.json({
      message: 'Category deleted successfully',
      data: deletedCategory
    }, { status: 200 });
  } catch (error) {
    return handleError(error, 'Failed to delete category');
  }
}

// PATCH (increment usedCount when a category is used)
export async function PATCH(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    await mongooseConnect();
    
    const category = await Category.findById(id);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Increment usedCount when the category is used
    category.usedCount += 1;
    await category.save();
    
    return NextResponse.json({
      message: 'Category used count incremented successfully',
      data: category
    }, { status: 200 });
  } catch (error) {
    return handleError(error, 'Failed to increment used count');
  }
}
