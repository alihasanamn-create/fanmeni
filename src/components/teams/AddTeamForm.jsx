import { useEffect,useState } from "react";

import {
collection,
addDoc,
onSnapshot
} from "firebase/firestore";

import { db } from "../../firebase";

export default function AddTeamForm(){

const [students,setStudents] = useState([]);

const [teamName,setTeamName] = useState("");
const [teamColor,setTeamColor] = useState("");
const [badge,setBadge] = useState("");

const [captain,setCaptain] = useState("");
const [assistant,setAssistant] = useState("");

useEffect(()=>{

const unsub = onSnapshot(

collection(db,"students"),

(snapshot)=>{

const data = snapshot.docs.map((doc)=>({

id:doc.id,
...doc.data()

}));

setStudents(data);

}

);

return ()=>unsub();

},[]);

async function handleSubmit(e){

e.preventDefault();

await addDoc(

collection(db,"teams"),

{

teamName,
teamColor,
badge,
captain,
assistant

}

);

alert("Team Created");

setTeamName("");
setTeamColor("");
setBadge("");
setCaptain("");
setAssistant("");

}

return(

<form
onSubmit={handleSubmit}
className="bg-white rounded-3xl shadow p-8"
>

<h2 className="text-4xl font-bold text-[#8458B3] heading-font">

Create Team

</h2>

<div className="grid md:grid-cols-2 gap-5 mt-8">

<input
placeholder="Team Name"
value={teamName}
onChange={(e)=>setTeamName(e.target.value)}
className="border rounded-xl px-4 py-3"
/>

<select
value={teamColor}
onChange={(e)=>setTeamColor(e.target.value)}
className="border rounded-xl px-4 py-3"
>

<option value="">

Select Team Color

</option>

<option value="#4b83ff">

Blue

</option>

<option value="#2db36c">

Green

</option>

<option value="#ff4fa3">

Rose

</option>

<option value="#d4af37">

Gold

</option>

<option value="#ffd43b">

Yellow

</option>

</select>

<input
placeholder="/teams/blue.png"
value={badge}
onChange={(e)=>setBadge(e.target.value)}
className="border rounded-xl px-4 py-3 md:col-span-2"
/>

<select
value={captain}
onChange={(e)=>setCaptain(e.target.value)}
className="border rounded-xl px-4 py-3"
>

<option value="">

Select Captain

</option>

{students.map((s)=>(

<option
key={s.id}
value={s.name}
>

{s.code} - {s.name}

</option>

))}

</select>

<select
value={assistant}
onChange={(e)=>setAssistant(e.target.value)}
className="border rounded-xl px-4 py-3"
>

<option value="">

Select Assistant Captain

</option>

{students.map((s)=>(

<option
key={s.id}
value={s.name}
>

{s.code} - {s.name}

</option>

))}

</select>

</div>

<button className="bg-[#8458B3] text-white px-8 py-4 rounded-xl mt-8">

Save Team

</button>

</form>

)

}