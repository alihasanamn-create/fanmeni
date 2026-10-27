import { Link } from "react-router-dom";

export default function Navbar(){

return(

<nav className="bg-emerald-700 text-white shadow">

<div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">

<h1 className="font-bold text-lg">

FANMENI 26

</h1>

<div className="flex gap-6">

<Link to="/">Home</Link>

<Link to="/programs">Programs</Link>

<Link to="/results">Results</Link>

<Link to="/dashboard">Admin</Link>

</div>

</div>

</nav>

)

}