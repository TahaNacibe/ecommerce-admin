import SideBar from "../pages/components/sideBar";


export default function SettingsMainPage() {
    return (
        <div className="bg-white w-screen text-black flex flex-row text-3xl">
            {/* side bar */}
             <SideBar />
            {/* page ui */}
            Settings
        </div>
    )
}