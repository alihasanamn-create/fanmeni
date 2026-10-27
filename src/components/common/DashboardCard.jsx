export default function DashboardCard({
title,
value,
color
}){

return(

<div
className="rounded-2xl p-6 text-white shadow-lg hover:scale-[1.02] transition"
style={{
background:color
}}
>

<h2 className="text-lg opacity-90">

{title}

</h2>

<p className="text-4xl font-bold mt-4">

{value}

</p>

</div>

)

}