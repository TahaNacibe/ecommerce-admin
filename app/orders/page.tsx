import SideBar from "../pages/components/sideBar";


export default function OrderMainPage() {
    return (
        <div className="bg-white w-screen text-black flex flex-row text-3xl">
             {/* side bar */}
             <SideBar />
            {/* page ui */}
            Order
        </div>
    )
}