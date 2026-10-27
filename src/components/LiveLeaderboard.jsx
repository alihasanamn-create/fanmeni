import { useEffect,useState } from "react";
import { collection,onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function LiveLeaderboard(){

const [teams,setTeams]=useState({});

useEffect(()=>{

const unsub=onSnapshot(collection(db,"results"),(snap)=>{

let scores={};

snap.docs.forEach(doc=>{

const r=doc.data();

if(!scores[r.team]){
scores[r.team]=0;
}

scores[r.team]+=Number(r.points);

});

setTeams(scores);

});

return()=>unsub();

},[])

const sorted=Object.entries(teams)
.sort((a,b)=>b[1]-a[1]);

return(

<div className="bg-white rounded-xl p-6 shadow-md card-hover">

<h2 className="text-2xl font-bold mb-4 text-emerald-700">

Team Leaderboard

</h2>

<table className="w-full text-center">

<thead className="bg-emerald-600 text-white">

<tr>
<th className="p-2">Rank</th>
<th>Team</th>
<th>Points</th>
</tr>

</thead>

<tbody>

{sorted.map(([team,pts],i)=>(

<tr key={i} className="border-b hover:bg-gray-50">

<td className="font-semibold">{i+1}</td>
<td>{team}</td>
<td className="font-bold text-emerald-700">{pts}</td>

</tr>

))}

</tbody>

</table>

</div>

)

}