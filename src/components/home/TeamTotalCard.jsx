export default function TeamTotalCard({
team,
points,
color,
badge
}){

return(

<div
className="rounded-3xl shadow-xl p-8 text-white hover:scale-[1.02] transition"
style={{
background:color
}}
>

<div className="flex items-center justify-between">

<div>

<h2 className="text-3xl font-bold heading-font">

{team}

</h2>

<p className="opacity-90 mt-2">

Total Points

</p>

</div>

<img
src={badge}
alt="badge"
className="w-20 h-20 object-contain"
/>

</div>

<h1 className="text-6xl font-bold mt-8">

{points || 0}

</h1>

</div>

)

}