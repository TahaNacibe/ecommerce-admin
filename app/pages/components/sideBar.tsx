"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronFirst, ChevronLast } from "lucide-react";
import { useState } from "react";

export default function SideBar() {
    {/* vars for managing ui state and other */}
    const [isOpen, setIsOpen] = useState(false);
    const [isFolded, setFolded] = useState<Boolean>(true)

    {/* get current rout */}
    const pathname = usePathname();

    {/* get current user */}
    const { data: session } = useSession();

    {/* ui vars */}
    const inactiveStyle = "flex flex-row gap-2 py-3 px-4 items-center text-sm hover:bg-indigo-400/5 transition-colors duration-200";
    const activeStyle = inactiveStyle + " text-sm bg-indigo-400/10 text-indigo-900 font-base";

    {/* set user details to evade null case */}
    const userName = session?.user?.name || "Guest";
    const userEmail = session?.user?.email || "Not Connected To email?";
    
    const userPfp = session?.user?.image;
    {/* nav bar items list */}
    const navItems = [
        {
            href: "/",
            label: "Admin Console",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                </svg>
            )
        },
        {
            href: "/dashboard",
            label: "Dashboard",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
            )
        },
        {
            href: "/products",
            label: "Products",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                </svg>
            )
        },
        {
            href: "/categories",
            label: "Categories",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
              </svg>
              
            )
        },
        {
            href: "/orders",
            label: "Orders",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
            )
        },
        {
            href: "/settings",
            label: "Settings",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.867 19.125h.008v.008h-.008v-.008Z" />
                </svg>
            )
        }
    ];

    {/* return the right icon for the state */ }
    const GetIconForSidebar = () => {
        return (isFolded? 
        <ChevronLast /> : <ChevronFirst />)
    }

    {/* display in case user signed in */}
    return (
        <>
            {/* Mobile Menu Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-lg text-black ${isOpen? "hidden" : "block"}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
                </svg>

            </button>

            {/* Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <nav className={`fixed lg:static top-0 flex flex-col left-0 z-40 h-screen bg-white text-black border-r-2 ease-in-out
                ${isOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'} 
                 transition-all duration-500 ${isFolded? "lg:w-16" : "lg:w-1/6"}`}
            >

                {/* User Profile */}
                <div className="border-b px-2 py-4 flex items-center gap-3 bg-gray-400/5">
                    <div className="rounded-full bg-black p-0.5 flex-shrink-0">
                        {
                            /* check if pfp exist and return img or placeholder widget */
                            userPfp? 
                                <img src={userPfp} className={`rounded-full ${isFolded ? "w-8 h-8" : "w-9 h-9"}`} alt={userName} />
                                //* place holder no image case
                                : <div className={`rounded-full bg-gray-600 text-white text-base font-extralight text-center justify-around flex flex-col ${isFolded ? "w-8 h-8" : "w-9 h-9"}`}>
                                    {userName[0].toUpperCase()}
                                </div>
                        }
                    </div>
                    <div className={`min-w-0 truncate whitespace-nowrap transition-all duration-500 ${isFolded? "opacity-0 max-w-0" : "opacity-100 max-w-full"}`}>
                        <h1 className="text-sm font-medium truncate">{userName}</h1>
                        <h3 className="text-xs font-extralight text-gray-500 truncate">{userEmail}</h3>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="h-[80%]">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={pathname === item.href ? activeStyle : inactiveStyle}
                            onClick={() => setIsOpen(false)}
                        >
                            {item.icon}
                            <span className={`truncate whitespace-nowrap transition-all duration-500 ${isFolded? "opacity-0 max-w-0" : "opacity-100 max-w-full"}`}>{item.label}</span>
                        </Link>
                    ))}
                </div>

                {/* fold button */}
                <div className="cg px-4 py-4 flex items-center gap-3 bg-gray-400/5">
                    <button onClick={() => setFolded(!isFolded)}>
                    <GetIconForSidebar />
                    </button>

                </div>
            </nav>
        </>
    );
}