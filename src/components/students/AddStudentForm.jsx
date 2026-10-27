import { useState } from "react";

import {
collection,
addDoc
} from "firebase/firestore";

import { db } from "../../firebase";

export default function AddStudentForm(){

const [code,setCode] = useState("");
const [name,setName] = useState("");
const [category,setCategory] = useState("");
const [team,setTeam] = useState("");
const [photo,setPhoto] = useState("");

async function handleSubmit(e){

e.preventDefault();

await addDoc(collection(db,"students"),{

code,
name,
category,
team,
photo,
points:0

});

alert("Student Added");

setCode("");
setName("");
setCategory("");
setTeam("");
setPhoto("");

}

return(

<form
onSubmit={handleSubmit}
className="bg-white rounded-2xl shadow p-6"
>

<h2 className="text-3xl font-bold text-[#8458B3] heading-font">

Add Student

</h2>

<div className="grid md:grid-cols-2 gap-5 mt-8">

<input
placeholder="Student Code"
value={code}
onChange={(e)=>setCode(e.target.value)}
className="border rounded-xl px-4 py-3"
/>

<input
placeholder="Student Name"
value={name}
onChange={(e)=>setName(e.target.value)}
className="border rounded-xl px-4 py-3"
/>

<select
value={category}
onChange={(e)=>setCategory(e.target.value)}
className="border rounded-xl px-4 py-3"
>

<option value="">Select Category</option>

<option>Bidaya</option>
<option>Thaniya</option>

</select>

<select
value={team}
onChange={(e)=>setTeam(e.target.value)}
className="border rounded-xl px-4 py-3"
>

<option value="">Select Team</option>

<option>Blue</option>
<option>Green</option>

</select>

<input
placeholder="/students/S001.jpg"
value={photo}
onChange={(e)=>setPhoto(e.target.value)}
className="border rounded-xl px-4 py-3 md:col-span-2"
/>

</div>

<button className="bg-[#8458B3] text-white px-6 py-3 rounded-xl mt-8">

Save Student

</button>

</form>

)

}