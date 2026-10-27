import { useEffect,useState } from "react";
import { collection,onSnapshot,query,orderBy } from "firebase/firestore";
import { db } from "../firebase";

export default function ResultTicker(){

const [results,setResults]=useState([]);

useEffect(()=>{

const q=query(
collection(db,"results"),
orderBy("timestamp","desc")
)

const unsub=onSnapshot(q,(snap)=>{

const data=snap.docs.map(doc=>doc.data());

setResults(data);

});

return()=>unsub();

},[])

return(

<div className="bg-white rounded-lg shadow-sm p-3 overflow-hidden">

<div className="ticker">

{results.slice(0,10).map((r,i)=>(

<span key={i} className="mx-8 font-medium text-emerald-700">

🏆 {r.program} → {r.student} ({r.team}) – {r.points} pts

</span>

))}

</div>

</div>

)

}