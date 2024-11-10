"use client"
import CustomInput from "@/app/components/costume_input";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import SideBar from "@/app/pages/components/sideBar";
import axios from "axios";
import { redirect } from "next/navigation";

export default function NewProductPage() {

    //* const 
    type Product = {
        title: string;
        description: string;
        quantity: number;
        price: string;
        productType: string;
        isInDiscount: boolean;
        discountPrice: number;
        category: string[]; 
        tags: string[]; 
        other_images: string[];
        image: string;
        isUnlimited : boolean
    };
    //* default value of the fields
    const defaultValue : Product = {
        title: '',
        description: '',
        discountPrice: 0,
        isInDiscount: false,
        quantity : 0,
        price: '',
        productType: '',
        category: [],
        isUnlimited: false,
        other_images: [],
        image: "",
        tags: [],
    }
    //* max number of images
      const MAX_IMAGES = 5

    //* vars for the fields and images
    const [errorStack, setErrorStack] = useState<string | null>(null)
    const [isLoading, setLoadingState] = useState(false)
    const [isCreated, setIsCreated] = useState(false)
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [bigImage, setBigImage] = useState<File | null>(null);
    const [bigImagePreview, setBigImagePreview] = useState<string | null>(null);
    const [formData, setFormData] = useState(defaultValue);

    //* enums
    const productTypes = ["digital", "physical"];
    const availableTags = ["sale", "new", "popular", "limited-edition"];

    //* Form field handlers
    const handleInputChange = (field: string, value: string) => {

        //* set the amount to unlimited if it set to 0
        if (field === "quantity" && value != "0") {
            setFormData(prev => ({
                ...prev,
                quantity: Number(value)
            }))
        }
        //* update whole data
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    //* switch the product type  
    const handleProductTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            productType: e.target.value
        }));
    };

    //* switch the toggle state 
    const handleTagToggle = (tag: string) => {
        setFormData((prev : any) => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter((t : any) => t !== tag)
                : [...prev.tags, tag]
        }));
    };

     //* switch the limited state
     const handleLimitButton = (e: any) => {
        e.preventDefault()
        setFormData(prev => ({
            ...prev,
            quantity: 0,
            isUnlimited: !formData.isUnlimited
        }))
    }

     //* switch the discount state
     const handleDiscountState = (e: any) => {
        e.preventDefault()
        setFormData(prev => ({
            ...prev,
            isInDiscount: !formData.isInDiscount
        }))
    }

    //* clear all the fields of the page
    const clearAllFields = () => {
        setFormData(defaultValue);
    };

    // Modified addProduct function to ensure proper data flow
const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.title === "" || formData.price === "") {
        setErrorStack(formData.title === "" ? "Title is required for products!" : "A price is needed");
        return;
    }
    
    setLoadingState(true);
    try {
        // Get the updated form data with images
        const updatedFormData = await handleUpload();
        
        console.log('Sending to products API:', updatedFormData);
        
        // Use the updated form data for creating the product
        const response = await axios.post("/api/products", updatedFormData);
        
        if (response.status === 201) {
            setIsCreated(true);
        }
    } catch (error) {
        console.error("Error:", error);
        setErrorStack("Failed to create product");
    } finally {
        setLoadingState(false);
    }
    };
    
    
    //* the situation message that show on the top of the screen 
    const TopSideMessage = () => {
        return (
            errorStack ? (
                <div className="bg-red-400 rounded-lg w-full p-4 my-4 flex flex-row justify-between text-white">
                    <h1 className="text-lg">{errorStack}</h1>
                    <button onClick={() => setErrorStack(null)}><X /></button>
                </div>
            ) : isLoading ? (
                <div className="bg-indigo-300 rounded-lg w-full p-4 my-4 flex flex-row justify-between text-white">
                    <h1 className="text-lg">Uploading Product</h1>
                </div>
            ) : null
        );
    }

    //* handle the additional images the user can also add
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
          const selectedFiles = Array.from(e.target.files);
    
          if (selectedFiles.length + images.length > MAX_IMAGES) {
            setErrorStack(`You can only upload up to ${MAX_IMAGES} images.`);
            return;
          }
    
          setErrorStack(null); // Clear any existing error messages
          setImages((prevImages) => [...prevImages, ...selectedFiles]);
    
          // Generate preview URLs
          const newPreviewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
          setPreviews((prevPreviews) => [...prevPreviews, ...newPreviewUrls]);
        }
    };
    
    //* handle the product big image selection
    const handleBigImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setBigImage(file); // Store selected file
          setBigImagePreview(URL.createObjectURL(file)); // Create preview URL
        }
      };

      //* remove an item from the list
    const handleRemoveImage = (index: number) => {
        // Create a new copy of the previews and images arrays, excluding the removed item
        const newPreviews = [...previews];
        const newImages = [...images];
        
        newPreviews.splice(index, 1);
        newImages.splice(index, 1);
        
        // Update the state with the new arrays
        setPreviews(newPreviews);
        setImages(newImages);
    };
    
    
    // Modified handleUpload function to work with the above
    const handleUpload = async () => {
        try {
            if (!bigImage) {
                throw new Error('Main image is required');
            }
    
            // Convert main image to base64
            const mainImageBase64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = () => reject('Error reading main image file');
                reader.readAsDataURL(bigImage);
            });
    
            let additionalImagesBase64: string[] = [];
            
            // Check if images exists and is not empty
            if (images && images.length > 0) {
                console.log('Number of additional images:', images.length);
                
                if (images.length > 5) {
                    throw new Error('Maximum 5 additional images allowed');
                }
    
                const imageArray = Array.from(images);
                additionalImagesBase64 = await Promise.all(
                    imageArray.map(
                        (image) =>
                            new Promise<string>((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onloadend = () => resolve(reader.result as string);
                                reader.onerror = () => reject('Error reading image file');
                                reader.readAsDataURL(image);
                            })
                    )
                );
                
                console.log('Converted additional images:', additionalImagesBase64.length);
            }
    
            // Log the request payload for debugging
            console.log('Sending to upload API:', {
                hasMainImage: !!mainImageBase64,
                numberOfAdditionalImages: additionalImagesBase64.length
            });
    
            // Make a single request with both main image and additional images
            const response = await axios.post('/api/uploadImage', {
                image: mainImageBase64,
                other_images: additionalImagesBase64
            });
    
            console.log('Upload API response:', response.data);
    
            const { mainImageUrl, otherImageUrls } = response.data;
    
            // Ensure otherImageUrls is always an array
            const safeOtherImageUrls = Array.isArray(otherImageUrls) ? otherImageUrls : [];
    
            // Return a promise that resolves with the new form data
            return new Promise((resolve) => {
                setFormData((prev) => {
                    const newFormData = {
                        ...prev,
                        image: mainImageUrl,
                        other_images: safeOtherImageUrls, // Use the safe array
                    };
                    console.log('Updated form data:', newFormData);
                    resolve(newFormData);
                    return newFormData;
                });
            });
    
        } catch (error) {
            console.error('Error in handleUpload:', error);
            throw error instanceof Error ? error : new Error('Failed to upload images');
        }
    };
    

      //* return to the product page if created
    if (isCreated) {
        return redirect("/products");
    }

    {/* the ui tree */}
    return (
        <section className="bg-white w-full min-h-screen flex flex-row h-screen overflow-hidden">
            {/* side bar */}
            <SideBar />


            {/* page ui */}
            <div className="w-full min-h-screen flex flex-col p-4 overflow-y-auto flex-1">
            {/* section title */}
            <nav className="text-black flex flex-row gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mt-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
                </svg>
                
                    

                {/* the links and go back option */}
                <h1 className="font-extralight text-lg text-gray-600">
                    <Link href={"/products"} className="hover:text-black">
                        {" Products "}
                    </Link>
                    | New Product
                </h1>
                </nav>


                {/* message widget */}
                <TopSideMessage />
            
                
            {/* section content */}
            <form
                onSubmit={(e) => addProduct(e)}
                    className="flex-1 flex flex-col md:flex-row mt-4">
                    
                    
                {/* Left side - Image upload and submit button */}
                <div className="w-full md:w-2/4 relative">
                    <div
                        onClick={() => clearAllFields()}
                        className="rounded-lg bg-gray-200/50 w-fit px-4 py-1 cursor-pointer text-black">
                        <h3 className="text-sm font-medium">
                            Clear all fields ?
                        </h3>
                    </div>
                    
                        

                    {/* product image */}
                        <div
                            className="border rounded-lg border-dashed flex h-48 md:h-1/3 items-center justify-center  text-black mx-2 my-4">
                         <input 
                                type="file" 
                                accept="image/*" 
                                multiple 
                                onChange={handleBigImageChange}
                                className="absolute h-48 md:h-1/3 mt-4  inset-0 opacity-0 cursor-pointer " 
                                />
                            
                            {/* show the image if exist or show an dead icon */}
                            {bigImagePreview
                            ? <img src={bigImagePreview} alt="" className="rounded-lg h-full" />
                            : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                            </svg>}
                    </div>
                    <p className="text-xs font-medium ml-4 pt-1 text-gray-400">
                        <strong className="text-black">
                            Image is Required*
                        </strong> client will need to see what they about to by, won't they?
                    </p>

                        
                        {/* The other images button */}
                        <h2 className="text-sm font-semibold pr-1 text-gray-600 p-2 pt-6">
                        Other Images (up to 5)
                        </h2>
                        <div className="flex flex-col gap-2 px-2 h-1/6">
                            

                        {/* Uploaded Images Preview */}
                        <div className="uploaded-urls">
                        <div className="preview grid grid-cols-5 gap-2 mt-4">
                            {previews.map((src, index) => (
                            <div key={index} className="relative">
                                {/* Image */}
                                <img src={src} alt={`preview ${index}`} className="w-28 h-28 object-cover rounded-lg" />
                                
                                {/* X Icon Overlay */}
                                <div 
                                className="absolute top-0 right-0 rounded-tr-lg rounded-bl-lg bg-white opacity-70 z-10 p-1 cursor-pointer" 
                                onClick={() => handleRemoveImage(index)} // Optional: Function to remove image
                                >
                                <X className="text-black" size={16} />
                                </div>
                            </div>
                            ))}
                        </div>
                        </div>



                                {/* Custom UI for file input */}
                                <div className={`relative border border-dashed rounded-lg mt-4 flex flex-shrink-0 items-center justify-center text-black cursor-pointer w-28 h-28 ${previews.length === MAX_IMAGES? "hidden" : "block"}`}>
                                <input 
                                type="file" 
                                accept="image/*" 
                                multiple 
                                onChange={handleImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                />
                                <Plus className="text-gray-500" />
                            </div>

                            {/* some details */}
                            <p className="text-xs font-medium mt-2 text-gray-400 p-2">
                            <strong className="text-black pr-2">
                                About images*
                            </strong> Those images will be displayed in the product page along side the other information, it give more information to the client about the product, a product may get taken down if the images doesn't meet our 
                            <Link
                                href={""}
                                className="text-blue-800 p-1 cursor-pointer font-semibold">
                                 guide lines!
                            </Link>
                        </p>
                        </div>

                    {/* Submit button - Desktop: absolute, Mobile: fixed */}
                    <div className="hidden md:block absolute bottom-4 left-4">
                        <button className="inline-flex items-center px-6 py-2 gap-2 bg-black hover:bg-black/80 text-white font-medium rounded-md">
                            <Plus />
                            <h2 className="text-lg">Add Product</h2>
                        </button>
                    </div>
                </div>

                    

                {/* Right side - Product information */}
                <div className="flex flex-col flex-1 p-4">
                    {/* product name section */}
                    <CustomInput
                        label="Product Name"
                        id="product"
                        importantNote="Product name is required"
                        helperText=" for search, and allowing the client to know what kind of product is it"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>}
                        value={formData.title}
                        onChange={(e) => {handleInputChange('title', e.target.value)}}
                    />

                        
                    {/* product description */}
                    <div className="mt-4">
                        <label 
                            htmlFor="description"
                            className="text-sm font-semibold text-gray-700 flex gap-2 items-center mb-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                            Description
                        </label>
                        <textarea
                            rows={7}
                            className="w-full border rounded-lg p-3 text-black resize-none"
                            placeholder="Description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                        />
                        <p className="text-xs font-medium mt-2 text-gray-400">
                            <strong className="text-black">
                                Description is Optional*
                            </strong> yet it's a good idea to explain your product, the offer ..., it may attract more clients!
                        </p>
                    </div>

                        
                    {/* price field */}
                    <div className="mt-4 mb-14">
                        <CustomInput
                            label="Price Tag (USD)"
                                id="price"
                                steps="0.01"
                            type="number"
                            importantNote="Price is required*"
                            helperText=" leaving the filed empty will automatically set it's price to 0.00$"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                          }
                            value={formData.price}
                            onChange={(e) => {handleInputChange('price', e.target.value)}}
                        />
                        </div>
                        

                        {/* other information section */}
                        <h1 className="text-black -mt-4 text-sm font-semibold">
                            Other Information
                        </h1>


                         {/* Product Type Selector */}
                            <div className="space-y-2 pt-2">
                            <label 
                                htmlFor="productType" 
                                className="block text-sm font-semibold text-gray-700"
                            >
                                Product Type
                            </label>
                            <select
                                id="productType"
                                value={formData.productType}
                                onChange={handleProductTypeChange}
                                className="block w-full rounded-md border-gray-300 border shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-3"
                            >
                                <option value="">Select product type</option>
                                {productTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </option>
                                ))}
                            </select>
                            </div>

                        
                            {/* Tags Multi-Select */}
                            <div className="space-y-2 py-4">
                            <label className="block text-sm font-semibold text-gray-700">
                                Tags
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {availableTags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleTagToggle(tag)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                                    ${formData.tags.includes(tag)
                                        ? 'bg-black text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {tag}
                                </button>
                                ))}
                            </div>
                            <p className="text-xs font-medium m2-4 text-gray-400">
                            <strong className="text-black">
                                Tags*
                            </strong> help your product reach the right clients
                        </p>
                            </div>
                        <div className="flex flex-row py-2 items-center gap-2">

                            
                            {/* unite count */}
                            <CustomInput
                                label="Unite in stock"
                                steps="0"
                            id="unite"
                            type={formData.isUnlimited? "text" :"number"}
                            importantNote="The Items count is Required*"
                            helperText="it help us know if that product is still available, also leaving the count at 0 will set it to unlimited automatically"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z" />
                          </svg>                          
                          }
                          value={formData.isUnlimited && formData.quantity === 0? "Unlimited" : formData.quantity.toString()}
                          onChange={(e) => {handleInputChange('quantity', formData.isUnlimited && formData.quantity === 0? "0" : e.target.value)}}
                          />
                          <button
                              onClick={(e) => handleLimitButton(e)}
                              className={`border rounded-lg px-2 py-2 w-40 text-sm h-fit ${formData.isUnlimited ? "bg-black text-white" : "text-black"}`}>
                              {formData.isUnlimited? "Set Limited" : "Set Unlimited"}
                          </button>
                        </div>
                         {/* the discount state */}
                         <div className="flex flex-row py-2 items-center gap-2">
                            {/* discount */}
                            <CustomInput
                                label="Discount Price"
                                steps="0.01"
                                isActive={formData.isInDiscount}
                            id="price"
                            type="number"
                            importantNote="Add in case you want to apply a discount"
                            helperText="Discounts will take effect immediately, please be carful"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z" />
                          </svg>                          
                          }
                            value={formData.isInDiscount && formData.discountPrice === 0? "No Discount applied" : formData.discountPrice.toString()}
                            onChange={(e) => {handleInputChange('discountPrice', formData.isInDiscount && formData.discountPrice === 0? "0" : e.target.value)}}
                            />
                            <button
                                onClick={(e) => handleDiscountState(e)}
                                className={`border rounded-lg px-2 py-2 w-40 text-sm h-fit ${formData.isInDiscount ? "bg-black text-white" : "text-black"}`}>
                                {!formData.isInDiscount? "Set Discount" : "remove Discount"}
                            </button>
                        </div>
                </div>

                    
                {/* Mobile Submit Button - Fixed at bottom */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-4 border-t">
                    <button className="w-full inline-flex items-center justify-center px-6 py-2 gap-2 bg-black hover:bg-black/80 text-white font-medium rounded-md">
                        <Plus />
                        <h2 className="text-lg">Add Product</h2>
                    </button>
                </div>
            </form>
            </div>
        </section>
    );
}