import { useEffect,useState } from "react";

import {
collection,
onSnapshot,
deleteDoc,
doc
} from "firebase/firestore";

import { db } from "../../firebase";

export default function TeamsTable(){

const [teams,setTeams] = useState([]);

useEffect(()=>{

const unsub = onSnapshot(

collection(db,"teams"),

(snapshot)=>{

const data = snapshot.docs.map((doc)=>({

id:doc.id,
...doc.data()

}));

setTeams(data);

}

);

return ()=>unsub();

},[]);

async function deleteTeam(id){

await deleteDoc(doc(db,"teams",id));

}

return(

<div className="grid md:grid-cols-2 gap-8 mt-10">

{teams.map((team)=>(

<div
key={team.id}
className="bg-white rounded-3xl shadow overflow-hidden"
>

{/* HEADER */}

<div
className="p-8 text-white"
style={{
background:team.teamColor
}}
>

<div className="flex items-center justify-between">

<div>

<h2 className="text-4xl font-bold heading-font">

{team.teamName}

</h2>

<p className="mt-4 opacity-90">

Captain: {team.captain}

</p>

<p className="mt-2 opacity-90">

Assistant: {team.assistant}

</p>

</div>

<img
src={team.badge}
alt="badge"
className="w-24 h-24 object-contain"
/>

</div>

</div>

{/* FOOTER */}

<div className="p-6">

<button
onClick={()=>deleteTeam(team.id)}
className="bg-red-100 text-red-500 px-5 py-3 rounded-xl"
>

Delete Team

</button>

</div>

</div>

))}

</div>

)

}