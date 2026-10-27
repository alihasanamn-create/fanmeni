import { useState } from "react";

import { collection, addDoc } from "firebase/firestore";

import { db } from "../firebase";

export default function ResultForm(){

const [program,setProgram] = useState("");
const [student,setStudent] = useState("");
const [team,setTeam] = useState("");
const [position,setPosition] = useState("");
const [grade,setGrade] = useState("");
const [photo,setPhoto] = useState("");

async function handleSubmit(e){

e.preventDefault();

await addDoc(collection(db,"arts_results"),{

program,
student,
team,
position,
grade,
photo,
timestamp:Date.now()

});

alert("Result Saved");

}

return(

<form
onSubmit={handleSubmit}
className="bg-white shadow rounded-xl p-6 space-y-4"
>

<h2 className="text-2xl font-bold text-[#8458B3]">

Upload Result

</h2>

<input
placeholder="Program Name"
value={program}
onChange={(e)=>setProgram(e.target.value)}
className="border p-3 rounded w-full"
/>

<input
placeholder="Student Name"
value={student}
onChange={(e)=>setStudent(e.target.value)}
className="border p-3 rounded w-full"
/>

<input
placeholder="Team Name"
value={team}
onChange={(e)=>setTeam(e.target.value)}
className="border p-3 rounded w-full"
/>

<input
placeholder="Position"
value={position}
onChange={(e)=>setPosition(e.target.value)}
className="border p-3 rounded w-full"
/>

<input
placeholder="Grade"
value={grade}
onChange={(e)=>setGrade(e.target.value)}
className="border p-3 rounded w-full"
/>

<input
placeholder='/students/S001.jpg'
value={photo}
onChange={(e)=>setPhoto(e.target.value)}
className="border p-3 rounded w-full"
/>

<button className="bg-[#8458B3] text-white px-6 py-3 rounded">

Save Result

</button>

</form>

)

}