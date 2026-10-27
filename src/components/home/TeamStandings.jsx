import useRealtimePoints from "../../hooks/useRealtimePoints";

export default function TeamStandings(){

const {

artsTotals

} = useRealtimePoints();

const standings = [

{
team:"Blue",
points:artsTotals["Blue"] || 0,
color:"bg-blue-500"
},

{
team:"Green",
points:artsTotals["Green"] || 0,
color:"bg-green-500"
}

]

.sort((a,b)=>b.points - a.points);

return(

<div className="bg-white rounded-3xl shadow p-4 md:p-8">

<div className="flex justify-between items-center">

<h2 className="text-3xl md:text-4xl font-bold text-[#8458B3] heading-font">

Team Standings

</h2>

<div className="bg-[#8458B3] text-white px-5 py-3 rounded-xl">

LIVE

</div>

</div>

<div className="space-y-6 mt-10">

{standings.map((team,index)=>(

<div
key={index}
className="bg-[#faf8ff] rounded-3xl p-6 flex items-center gap-6 border"
>

{/* RANK */}

<div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl font-bold shadow">

{index + 1}

</div>

{/* TEAM COLOR */}

<div className={`w-8 h-20 rounded-full ${team.color}`}/>

{/* TEAM INFO */}

<div>

<h2 className="text-3xl font-bold">

{team.team}

</h2>

<p className="text-gray-500 mt-2">

Arts Points

</p>

</div>

{/* POINTS */}

<div className="ml-auto text-right">

<h1 className="text-5xl font-bold text-[#8458B3]">

{team.points}

</h1>

<p className="text-gray-500 mt-2">

Points

</p>

</div>

</div>

))}

</div>

{/* LEAD STATUS */}

{standings.length >= 2 && (

<div className="bg-gradient-to-r from-[#8458B3] to-[#a28089] rounded-3xl p-6 text-white mt-10 text-center">

<h2 className="text-2xl md:text-3xl font-bold">

🔥 {standings[0].team} Team Leads by {" "}

{standings[0].points - standings[1].points}

Points

</h2>

</div>

)}

</div>

)

}