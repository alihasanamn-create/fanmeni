import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function PodiumLeaderboard() {

const [teams,setTeams] = useState([]);

useEffect(()=>{

const unsub = onSnapshot(collection(db,"results"),(snap)=>{

let scores = {};

snap.docs.forEach(doc=>{

const r = doc.data();

if(!scores[r.team]){
scores[r.team] = 0;
}

scores[r.team] += Number(r.points);

});

const sorted = Object.entries(scores)
.map(([team,points])=>({team,points}))
.sort((a,b)=>b.points-a.points);

setTeams(sorted);

});

return ()=>unsub();

},[])

const first = teams[0];
const second = teams[1];
const third = teams[2];

return(

<div className="bg-white rounded-xl shadow-md p-8 text-center">

<h2 className="text-3xl font-bold text-emerald-700 mb-8">

Top Teams

</h2>

<div className="flex justify-center items-end gap-6">

{/* SECOND PLACE */}

{second && (

<div className="text-center">

<div className="bg-gray-200 w-28 h-28 rounded-full flex items-center justify-center text-xl font-bold">

🥈

</div>

<p className="mt-3 font-semibold">

{second.team}

</p>

<p className="text-emerald-700 font-bold">

{second.points} pts

</p>

<div className="bg-gray-300 mt-3 h-20 w-28 rounded-t-lg"></div>

</div>

)}

{/* FIRST PLACE */}

{first && (

<div className="text-center">

<div className="bg-yellow-300 w-32 h-32 rounded-full flex items-center justify-center text-2xl font-bold">

🥇

</div>

<p className="mt-3 font-bold text-lg">

{first.team}

</p>

<p className="text-emerald-700 font-bold">

{first.points} pts

</p>

<div className="bg-yellow-400 mt-3 h-28 w-32 rounded-t-lg"></div>

</div>

)}

{/* THIRD PLACE */}

{third && (

<div className="text-center">

<div className="bg-orange-200 w-28 h-28 rounded-full flex items-center justify-center text-xl font-bold">

🥉

</div>

<p className="mt-3 font-semibold">

{third.team}

</p>

<p className="text-emerald-700 font-bold">

{third.points} pts

</p>

<div className="bg-orange-300 mt-3 h-16 w-28 rounded-t-lg"></div>

</div>

)}

</div>

</div>

)

}