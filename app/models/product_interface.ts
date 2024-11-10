type ProductType = {
    title: string;
    description: string;
    quantity: number;
    price: string;
    productType: string;
    category: string[]; 
    discountPrice: number,
    tags: string[]; 
    isInDiscount: boolean;
    other_images: string[];
    image: string;
    isUnlimited: boolean;
    sold?: number;
    _id: string
};

export default ProductType