"use client"
import Link from "next/link"
import SideBar from "../pages/components/sideBar"
import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import axios from "axios"
import ProductsTable from "./components/tableOfItems"
import ProductType from "../models/product_interface"
import { useSession } from "next-auth/react"
import UnauthenticatedPage from "../unauthorized/page"

export default function ProductMainPage() {


    {/* vars */ }
    const filterOptionsCount: Array<string> = ["out of stock", "in stock", "unlimited"]
    const filterOptionsType: Array<string> = ["digital", "physical"]
    type FilterType = keyof FilterListInterFace;
    interface FilterListInterFace{
        count: string[]
        type: string[]
        discount: string
    }


    {/* the state management */}
    const [products, setProducts] = useState<Array<ProductType> | null>(null)
    const [isFilter, setIsFilter] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [filterLists, setFilterLists] = useState<FilterListInterFace>({
        count: [],
        type: [],
        discount: ""
    })
    
    useEffect(() => {
        console.log("------------> start fetching")
        axios.get("/api/products").then((respond) => {
            if (respond) {
                console.log("products", respond)
                setProducts(respond.data.products)
            }
        })
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Search submitted:', searchValue);
      };
    
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          setSearchValue(e.target.value);
        if (!isExpanded) {
          setIsExpanded(true);
        }
      };
    
      const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        // Only collapse if the input is empty and the user clicks outside
        if (!searchValue.trim()) {
          setIsExpanded(false);
        }
      };
    
      
      const SearchBar = () => {
        return (
            <div className={`flex justify-end ${isExpanded ? 'w-52 md:64' : 'w-10'} 
                    transition-all duration-300 ease-in-out overflow-hidden rounded-md`}>
                <form
                    onSubmit={handleSubmit}
                    className={`flex items-center bg-white border border-gray-300 shadow-sm 
                    overflow-hidden rounded-md`}
                >
                    <button
                        type={isExpanded ? 'submit' : 'button'}
                        onClick={() => !isExpanded && setIsExpanded(true)}
                        className="p-2 hover:bg-gray-100"
                    >
                        <Search className="w-6 h-6 text-gray-500" />
                    </button>

                    <input
                        type="text"
                        value={searchValue}
                        onChange={handleChange}
                        placeholder="Search..."
                        className={`w-full px-2 py-1 outline-none bg-transparent
                        ${isExpanded ? 'opacity-100' : 'opacity-0'} 
                        transition-opacity duration-300
                        ${isExpanded ? 'block' : 'hidden'}`}
                        onBlur={handleBlur}
                        autoFocus={isExpanded}  // Ensures focus stays when expanded
                    />
                </form>
            </div>
        );
    }

    {/* select the filters */ }
    const handleFilterChange = (filterItem: string, filterType: FilterType) => {
        const newFilterList = [...filterLists[filterType]];
        if (newFilterList.includes(filterItem)) {
            const index = newFilterList.indexOf(filterItem)
            newFilterList.splice(index, 1)
        } else {
            newFilterList.push(filterItem)
        }
        setFilterLists(prev => ({
            ...prev,
            [filterType]: newFilterList
        }))
    }

    //* check if item is selected in tags
    const isItemTagSelected = (filterItem: string, filterType: FilterType) => {
        return filterLists[filterType].includes(filterItem)
    }

    //* the filter options
    const FilterOptionsWidget = () => {
        return (
            <div className="flex md:flex-row flex-col gap-4 justify-between">
                {/* filter by item count state */}
                <div className="flex gap-2 items-center">
                    <h1 className="text-lg font-medium"> Filter by stock state | </h1>
                {filterOptionsCount.map((elem, index) => (
                    <div
                        onClick={() => handleFilterChange(elem, "count")}
                        key={index}
                        className={`rounded-lg px-2 py-1 border cursor-pointer ${isItemTagSelected(elem, "count") ? "bg-black text-white" : "bg-white text-black"}`}>
                        <h2 className="">
                            {elem}
                        </h2>
                    </div>
                ))}
                </div>
                {/* filter by product type */}
                <div className="flex gap-2 items-center">
                <h1 className="text-lg font-medium"> Filter by Product type | </h1>
                {filterOptionsType.map((elem, index) => (
                    <div
                        onClick={() => handleFilterChange(elem, "type")}
                        key={index}
                        className={`rounded-lg px-2 py-1 border cursor-pointer ${isItemTagSelected(elem, "type") ? "bg-black text-white" : "bg-white text-black"}`}>
                        <h2 className="">
                            {elem}
                        </h2>
                    </div>
                ))}
                </div>
                {/* filter for discount */}
                <div
                        onClick={() => handleFilterChange("elem", "discount")}
                        className={`rounded-lg px-2 py-1 border cursor-pointer ${isItemTagSelected("elem", "discount") ? "bg-black text-white" : "bg-white text-black"}`}>
                        <h2 className="">
                            Discount
                        </h2>
                    </div>
            </div>
        )
    }

    //* function responsible for clearing the filter on close --> also do close it but you know i's obvious
    function handleFilterState(): void {
        if (isFilter) {
            const emptyData = {
                count: [],
                type: [],
                discount: ""
            }
            setFilterLists(emptyData)
        }
        setIsFilter(!isFilter)
    }

    const session = useSession()
    {/* in case of unauthenticated access break his back */ }
    if (session.status === "loading") {
        return 
    }
    if (session.status === "unauthenticated") {
        return (<UnauthenticatedPage />)
    }

    return (
        <section className="bg-white w-full h-screen flex flex-row overflow-hidden text-black">
            <SideBar />
            
            {/* Main content area */}
            <div className="w-full flex flex-col overflow-hidden">
                {/* Fixed navbar */}
                <nav className="px-2 py-1.5 border-b flex flex-row justify-between w-full bg-white">
                    {/* new item button */}
                    <Link
                        href={'/products/new_product/'}
                        type="button"
                        className="flex flex-row gap-2 items-center group/item text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 font-medium rounded-lg text-sm px-5 py-3 me-2 mb-2"
                    >
                        {/* icon of the box */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
                        </svg>

                        {/* the title for the button */}
                        <strong className="text-sm font-base">
                            | New Product
                        </strong>
                    </Link>

                    {/* other options */}
                    <div className="flex gap-4 p-2">
                        {/* search button */}
                        <SearchBar />

                        {/* filter type button */}
                        <button
                            onClick={() => handleFilterState()}
                            className="border p-1 px-2 rounded-md hover:bg-gray-100">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                            </svg>
                        </button>
                    </div>
                </nav>

                {/* Scrollable content area */}
                <div className="flex-1 overflow-auto p-4">
                    {/* filter section */}
                    <div className={`duration-300 ${isFilter ? "md:h-16 h-24 opacity-100" : "h-0 opacity-0"}`}>
                        <div className={`duration-200 ${isFilter? 'block' : "hidden"}`}>
                        <FilterOptionsWidget />
                        </div>
                    </div>
                    {products ? <ProductsTable products={products} searchQuery={searchValue} filters={filterLists} />
                : <h1>Loading ...</h1>    
                }
                    
                </div>
            </div>
        </section>
    )
}