import { useEffect,useState } from "react";

import {
collection,
query,
orderBy,
limit,
onSnapshot
} from "firebase/firestore";

import { db } from "../../firebase";

import useRealtimePoints from "../../hooks/useRealtimePoints";

export default function LiveTicker(){

const [results,setResults] = useState([]);

const {

artsTotals,
personalPoints

} = useRealtimePoints();

useEffect(()=>{

const q = query(

collection(db,"arts_results"),

orderBy("timestamp","desc"),

limit(5)

);

const unsub = onSnapshot(q,(snapshot)=>{

setResults(

snapshot.docs.map((doc)=>({

id:doc.id,
...doc.data()

}))

);

});

return ()=>unsub();

},[]);

const blue = artsTotals["Blue"] || 0;

const green = artsTotals["Green"] || 0;

const leader =

blue > green
? `🔥 Blue Team leads by ${blue - green} points`
: green > blue
? `🔥 Green Team leads by ${green - blue} points`
: "🔥 Teams are tied";

const champions = Object.values(personalPoints)

.sort((a,b)=>b.points - a.points);

const fanmeniTopper = champions[0];

const messages = [

leader,

fanmeniTopper
? `⭐ Fanmeni Topper: ${fanmeniTopper.name} (${fanmeniTopper.points} pts)`
: "⭐ Waiting for Topper",

...results.map((r)=>{

const first = r.positions?.first?.name || "Winner";

return `🏆 ${r.program} Result Published — 🥇 ${first}`;

})

];

return(

<div className="bg-[#8458B3] overflow-hidden rounded-2xl shadow-lg">

<div className="ticker-track py-4 whitespace-nowrap">

{messages.concat(messages).map((msg,index)=>(

<span
key={index}
className="text-white text-lg md:text-2xl font-semibold mx-10 inline-block"
>

{msg}

</span>

))}

</div>

</div>

)

}