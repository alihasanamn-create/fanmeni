import { useState } from "react";

import {
collection,
addDoc
} from "firebase/firestore";

import { db } from "../../firebase";

export default function AddProgramForm({

collectionName,
themeColor,
title

}){

const [ProgramCode,setProgramCode] = useState("");
const [ProgramName,setProgramName] = useState("");
const [Category,setCategory] = useState("");
const [Type,setType] = useState("");
const [ParticipantCount,setParticipantCount] = useState("");

async function handleSubmit(e){

e.preventDefault();

await addDoc(

collection(db,collectionName),

{
ProgramCode,
ProgramName,
Category,
Type,
ParticipantCount
}

);

alert("Program Added");

setProgramCode("");
setProgramName("");
setCategory("");
setType("");
setParticipantCount("");

}

return(

<form
onSubmit={handleSubmit}
className="bg-white rounded-3xl shadow p-8"
>

<h2
className="text-4xl font-bold heading-font"
style={{
color:themeColor
}}
>

{title}

</h2>

<div className="grid md:grid-cols-2 gap-5 mt-8">

<input
placeholder="Program Code"
value={ProgramCode}
onChange={(e)=>setProgramCode(e.target.value)}
className="border rounded-xl px-4 py-3"
/>

<input
placeholder="Program Name"
value={ProgramName}
onChange={(e)=>setProgramName(e.target.value)}
className="border rounded-xl px-4 py-3"
/>

<select
value={Category}
onChange={(e)=>setCategory(e.target.value)}
className="border rounded-xl px-4 py-3"
>

<option value="">Select Category</option>

<option>Bidaya</option>
<option>Thaniya</option>
<option>Both</option>

</select>

<select
value={Type}
onChange={(e)=>setType(e.target.value)}
className="border rounded-xl px-4 py-3"
>

<option value="">Select Type</option>

<option>Individual</option>
<option>Personal Group</option>
<option>Group</option>
<option>General</option>

</select>

<input
placeholder="Participant Count"
value={ParticipantCount}
onChange={(e)=>setParticipantCount(e.target.value)}
className="border rounded-xl px-4 py-3 md:col-span-2"
/>

</div>

<button
className="text-white px-8 py-4 rounded-xl mt-8"
style={{
background:themeColor
}}
>

Save Program

</button>

</form>

)

}