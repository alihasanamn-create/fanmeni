import { useEffect,useState } from "react";
import { collection,onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function PersonalChampion(){

const [players,setPlayers]=useState({});

useEffect(()=>{

const unsub=onSnapshot(collection(db,"results"),(snap)=>{

let scores={};

snap.docs.forEach(doc=>{

const r=doc.data();

if(!r.personal)return;

if(!scores[r.student]){
scores[r.student]=0;
}

scores[r.student]+=Number(r.points);

});

setPlayers(scores);

});

return()=>unsub();

},[])

const sorted=Object.entries(players)
.sort((a,b)=>b[1]-a[1]);

return(

<div className="bg-white rounded-xl p-6 shadow-md card-hover">

<h2 className="text-2xl font-bold mb-4 text-emerald-700">

Personal Champions

</h2>

<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

{sorted.slice(0,6).map(([name,pts],i)=>(

<div
key={i}
className="border rounded-lg p-4 text-center hover:bg-gray-50 transition"
>

<h3 className="font-semibold text-lg">

{name}

</h3>

<p className="text-emerald-700 font-bold">

{pts} pts

</p>

</div>

))}

</div>

</div>

)

}