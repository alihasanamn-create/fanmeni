import useRealtimePoints from "../../hooks/useRealtimePoints";

export default function LiveTeamTotals(){

const {

artsTotals

} = useRealtimePoints();

const blue = artsTotals["Blue"] || 0;

const green = artsTotals["Green"] || 0;

return(

<div className="grid grid-cols-2 gap-8">

<div className="bg-gradient-to-r from-blue-500 to-blue-400 rounded-3xl p-10 text-white shadow-2xl">

<h2 className="text-5xl font-bold heading-font">

Blue Team

</h2>

<h1 className="text-9xl font-bold mt-10">

{blue}

</h1>

</div>

<div className="bg-gradient-to-r from-green-500 to-green-400 rounded-3xl p-10 text-white shadow-2xl">

<h2 className="text-5xl font-bold heading-font">

Green Team

</h2>

<h1 className="text-9xl font-bold mt-10">

{green}

</h1>

</div>

</div>

)

}