import React, { useEffect, useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Tag, 
  Package, 
  Infinity,
  Archive,
  ImagePlus,
  PackageOpen,
  PackageX
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import ProductType from '@/app/models/product_interface';
import Category from '@/app/models/category_interface';


interface FilterListInterFace{
  count: string[]
  type: string[]
  discount: string
}

export default function ProductsTable({ products, filters, searchQuery }: { products: ProductType[] | null, searchQuery: string ,filters: FilterListInterFace }) {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [resultList, setResultList] = useState<ProductType[]>(products ?? [])
  
  useEffect(() => {
    if (!products) return;
  
    const filterAndSearchItems = () => {
      let filteredList = products;
  
      // Search logic
      if (searchQuery) {
        filteredList = filteredList.filter(product =>
          product.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      // Filter logic
      if (filters.count.length > 0 || filters.type.length > 0 || filters.discount.includes("elem") ) {
        filteredList = filteredList.filter((product) => {
          const matchesType =
           filters.type.length === 0 || filters.type.includes(product.productType);
           const discountMatch = filters.discount.length === 0  || filters.discount.includes("elem") && product.isInDiscount;
          const matchesCount =
            filters.count.length === 0 ||
            (product.quantity === 0 && filters.count.includes('out of stock')) ||
            (product.quantity > 0 && filters.count.includes('in stock')) ||
            (product.isUnlimited && filters.count.includes('unlimited'));
  
          return matchesType && matchesCount && discountMatch;
        });
      }
  
      setResultList(filteredList);
    };
  
    filterAndSearchItems();
  }, [products, searchQuery, filters]);
  

  const toggleRow = (index: number) => {
    setExpandedRows(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleRowClick = (index: number, e: React.MouseEvent) => {
    // Only toggle if we're not clicking a link or button
    if (!(e.target as HTMLElement).closest('a, button')) {
      toggleRow(index);
    }
  };

  const handleImageLoad = (imageUrl: string) => {
    setLoadedImages(prev => ({ ...prev, [imageUrl]: true }));
  };

  // StockBadge Component - same as before
  const StockBadge = ({ quantity, isUnlimited, soldCount }: { 
    quantity: number, 
    isUnlimited: boolean,
    soldCount?: number 
  }) => {
    if (isUnlimited) {
      return (
        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-sm bg-blue-50 text-blue-700 whitespace-nowrap">
          <Infinity className="w-4 h-4 mr-1" />
          Unlimited
        </div>
      );
    }

    if (quantity === 0) {
      return (
        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-sm bg-red-50 text-red-700 whitespace-nowrap">
          <Archive className="w-4 h-4 mr-1" />
          Out of Stock
        </div>
      );
    }

    const stockStatus = quantity <= 10 ? {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      label: 'Low Stock'
    } : {
      bg: 'bg-green-50',
      text: 'text-green-700',
      label: 'In Stock'
    };

    return (
      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm ${stockStatus.bg} ${stockStatus.text} whitespace-nowrap`}>
        <Package className="w-4 h-4 mr-1" />
        <span>{stockStatus.label}</span>
        <div className="ml-2 pl-2 border-l border-current/20 whitespace-nowrap">
          <span className="font-medium">{quantity}</span>
          {soldCount !== undefined && (
            <span className="text-gray-500 text-xs ml-1 whitespace-nowrap">({soldCount} sold)</span>
          )}
        </div>
      </div>
    );
  };

  // ImageWithPlaceholder Component - same as before
  const ImageWithPlaceholder = ({ src, alt, className }: { 
    src: string; 
    alt: string; 
    className: string; 
  }) => {
    const isLoaded = loadedImages[src];

    return (
      <div className={`relative ${className}`}>
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-gray-400" />
          </div>
        )}
        <img
          src={src}
          alt={alt}
          className={`rounded-lg object-cover w-full h-full ${!isLoaded ? 'opacity-0' : ''}`}
          onLoad={() => handleImageLoad(src)}
        />
      </div>
    );
  };

  // AdditionalImages Component - simplified with better empty state handling
  const AdditionalImages = ({ images, title, categories }: { images: string[], title: string, categories: Category[] }) => {
    const MAX_IMAGES = 5;
    const displayImages = images.slice(0, MAX_IMAGES);
    const remainingCount = images.length - MAX_IMAGES;

    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 w-3/4 md:w-full">
          {displayImages.length > 0 ? (
            <>
              {displayImages.map((img, i) => (
                <ImageWithPlaceholder
                  key={i}
                  src={img}
                  alt={`${title} - ${i + 1}`}
                  className="aspect-square"
                />
              ))}
              {remainingCount > 0 && (
                <div className="aspect-square rounded-lg bg-gray-50 flex items-center justify-center">
                  <span className="text-sm text-gray-500">+{remainingCount} more</span>
                </div>
              )}
            </>
          ) : (
              <div className="text-sm text-black">
                <h1 className="">
                No additional images available
                </h1>
            </div>
          )}
        </div>
      </div>
    );
  };

  function deleteProduct(id: string, index : number): void {
    try {
      resultList.splice(index, 1)
      const originalListIndex = products?.findIndex(product => product._id === id)
      if (originalListIndex) {
        products?.splice(originalListIndex, 1)        
      }
      axios.delete(`/api/products?id=${id}`)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[40px]" />
              <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px] sm:w-[200px]">
                Product
              </th>
              <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Info
              </th>
              <th scope="col" className="px-2 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px] sm:w-[150px]">
                Price
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {resultList ? (
              resultList.map((product, index) => (
                <React.Fragment key={index}>
                  <tr 
                    className={`group hover:bg-gray-50/70 transition-colors duration-200 cursor-pointer ${
                      expandedRows.includes(index) ? 'bg-gray-50' : ''
                    }`}
                    onClick={(e) => handleRowClick(index, e)}
                  >
                    <td className="px-2 sm:px-6 py-4">
                      <div className="transition-transform duration-200 group-hover:translate-x-1">
                        {expandedRows.includes(index) ? (
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-4">
                      {product.image ? (
                        <ImageWithPlaceholder
                          src={product.image}
                          alt={product.title}
                          className="w-16 h-16 sm:w-24 sm:h-24"
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-2 sm:px-6 py-4">
                      <div className="space-y-1.5">
                        <h3 className="text-sm font-semibold text-gray-900">{product.title}</h3>
                        {/* Description with explicit height and line clamp for consistent 2-line display */}
                        <p className="text-sm text-gray-500 line-clamp-2 h-10 overflow-hidden">
                          {product.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(product.categories ?? []).slice(0, 2).map((cat, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {cat.name}
                            </span>
                          ))}
                          {(product.categories ?? []).length > 2 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{product.categories.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-4">
                      <div className="flex justify-center">
                        <StockBadge 
                          quantity={product.quantity} 
                          isUnlimited={product.isUnlimited}
                          soldCount={product.sold}
                        />
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-4 text-right flex flex-col">
                      <span className={`text-base sm:text-base font-medium whitespace-nowrap ${product.isInDiscount? "text-gray-600 text-sm line-through" : "text-black"}`}>
                        ${Number(product.price).toFixed(2)}
                      </span>
                      <span className={`text-sm sm:text-base font-medium whitespace-nowrap ${product.isInDiscount? "block" : "hidden"}`}>
                       In discount: ${Number(product.discountPrice).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                  
                  {expandedRows.includes(index) && (
                    <tr className="bg-white">
                      <td colSpan={5} className="px-2 sm:px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                          <div className="space-y-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-3">Product Details</h4>
                              <dl className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] gap-y-3 text-sm">
                                <dt className="text-gray-500">Product Type:</dt>
                                <dd className="text-gray-900 font-medium">{product.productType}</dd>
                                <dt className="text-gray-500">Categories:</dt>
                                <dd className="text-gray-900">
                                  <div className="flex flex-wrap gap-1">
                                    {(product.categories ?? []).map((cat, i) => (
                                      <span key={i} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {cat.name}
                                      </span>
                                    ))}
                                  </div>
                                </dd>
                                {!product.isUnlimited && (
                                  <>
                                    <dt className="text-gray-500">Stock Status:</dt>
                                    <dd className="text-gray-900">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium whitespace-nowrap">{product.quantity} available</span>
                                        <span className="text-xs whitespace-nowrap">
                                          ({product.sold} sold)
                                        </span>
                                      </div>
                                    </dd>
                                  </>
                                )}
                                {/* Full description in expanded view */}
                                <dt className="text-gray-500">Description:</dt>
                                <dd className="text-gray-900">{product.description}</dd>
                              </dl>
                            </div>

                            {product.tags.length > 0 && (
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Tags</h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {product.tags.map((tag, i) => (
                                    <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors">
                                      <Tag className="w-3 h-3 mr-1" />
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* edit / delete product */}
                            <div
                              onClick={() => setExpandedRows([])}
                              className="bg-gray-50 rounded-lg p-4 flex gap-4">
                              <Link href={`/products/editProduct/${product._id}`} className='inline-flex gap-2 items-center px-4 py-1 rounded-lg text-base bg-blue-50 text-blue-700 whitespace-nowrap'>
                              <PackageOpen /> Edit Product
                              </Link>
                              <button onClick={() => deleteProduct(product._id, index)} className='inline-flex gap-2 items-center px-4 py-1 rounded-lg text-base bg-red-50 text-red-700 whitespace-nowrap'>
                              <PackageX /> Remove Product
                              </button>
                            </div>
                          </div>

                          {
                            <AdditionalImages 
                              images={product.other_images}
                              categories={product.categories}
                              title={product.title}
                            />
                          }
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-2 sm:px-6 py-4 text-center text-sm text-gray-500">
                  <div className="flex flex-col items-center space-y-2">
                    <Package className="w-8 h-8 text-gray-400" />
                    <p>No products available</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}