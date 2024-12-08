import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(req: NextRequest) {
  try {
    let mainImageUpload;
    // Get the images from the request body
    const { image, other_images } = await req.json();
    if (image) {
      // Upload main image
      mainImageUpload = await cloudinary.uploader.upload(image, {
        upload_preset: "cap9r9nu"
      });
      
    }



    // Handle other images if they exist
    let otherImageUrls: string[] = [];
    if (other_images && Array.isArray(other_images)) {
      // Upload all other images concurrently
      const uploadPromises = other_images.map(img => 
        cloudinary.uploader.upload(img, {
          upload_preset: "cap9r9nu"
        })
      );

      const results = await Promise.all(uploadPromises);
      otherImageUrls = results.map(result => result.secure_url);
    }

    return NextResponse.json({
      success: true,
      mainImageUrl: mainImageUpload?.secure_url,
      otherImageUrls
    });

  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json(
      { error: 'Image upload failed' },
      { status: 500 }
    );
  }
}