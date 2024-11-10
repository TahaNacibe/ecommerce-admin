import SideBar from "../pages/components/sideBar";


export default function DashBoardMainPage() {
    return (
        <div className="bg-white w-screen h-screen text-black flex flex-row text-3xl">
             {/* side bar */}
             <SideBar />
            {/* page ui */}
            DashBoard
        </div>
    )
}