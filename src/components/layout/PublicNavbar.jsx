import { Link } from "react-router-dom";

export default function PublicNavbar(){

const navItems = [

{
name:"Home",
path:"/"
},

{
name:"Arts Results",
path:"/arts-results"
},

{
name:"Sports Results",
path:"/sports-results"
},


{
name:"Programs",
path:"/programs"
}

];

return(

<nav className="bg-white shadow sticky top-0 z-50">

<div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col lg:flex-row gap-4 lg:gap-0 items-center justify-between">

{/* LEFT */}

<div className="flex items-center gap-4">

<img
src="/logo/fanmeni.png"
alt="logo"
className="w-12 h-12 md:w-14 md:h-14 object-contain"
/>

<div>

<h1 className="text-xl md:text-2xl font-bold text-[#8458B3] heading-font">

FANMENI 26

</h1>

<p className="text-xs md:text-sm text-gray-500">

Siddeeq Moula Arabic College

</p>

</div>

</div>

{/* RIGHT */}

<div className="flex flex-wrap justify-center gap-3 md:gap-6">

{navItems.map((item,i)=>(

<Link
key={i}
to={item.path}
className="text-sm md:text-base font-semibold text-gray-700 hover:text-[#8458B3] transition"
>

{item.name}

</Link>

))}

</div>

</div>

</nav>

)

}