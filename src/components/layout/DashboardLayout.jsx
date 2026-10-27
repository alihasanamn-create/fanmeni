import Sidebar from "./Sidebar";

import Topbar from "./Topbar";

export default function DashboardLayout({children}){

return(

<div className="flex bg-[#f6f7fb] min-h-screen overflow-hidden">

{/* SIDEBAR */}

<div className="hidden lg:block">

<Sidebar/>

</div>

{/* MAIN */}

<div className="flex-1 w-full">

<Topbar/>

<div className="p-4 md:p-6 lg:p-8">

{children}

</div>

</div>

</div>

)

}