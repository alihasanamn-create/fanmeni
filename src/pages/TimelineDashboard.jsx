import { useEffect,useState } from "react";

import {
collection,
addDoc,
onSnapshot,
deleteDoc,
doc
} from "firebase/firestore";

import { db } from "../firebase";

import DashboardLayout from "../components/layout/DashboardLayout";

export default function TimelineDashboard(){

const [program,setProgram] = useState("");

const [date,setDate] = useState("");

const [time,setTime] = useState("");

const [venue,setVenue] = useState("");

const [status,setStatus] = useState("Upcoming");

const [timeline,setTimeline] = useState([]);

useEffect(()=>{

const unsub = onSnapshot(

collection(db,"program_timeline"),

(snapshot)=>{

setTimeline(

snapshot.docs.map((doc)=>({

id:doc.id,
...doc.data()

}))

);

}

);

return ()=>unsub();

},[]);

async function addTimeline(){

if(!program || !date || !time){

alert("Fill all required fields");

return;

}

await addDoc(

collection(db,"program_timeline"),

{
program,
date,
time,
venue,
status
}

);

setProgram("");
setDate("");
setTime("");
setVenue("");
setStatus("Upcoming");

}

async function deleteTimeline(id){

await deleteDoc(

doc(db,"program_timeline",id)

);

}

const sortedTimeline = [...timeline].sort((a,b)=>{

const first = new Date(`${a.date} ${a.time}`);

const second = new Date(`${b.date} ${b.time}`);

return first - second;

});

function getStatusColor(status){

switch(status){

case "Upcoming":
return "bg-blue-100 text-blue-600";

case "Ongoing":
return "bg-green-100 text-green-600";

case "Completed":
return "bg-gray-200 text-gray-700";

case "Postponed":
return "bg-red-100 text-red-600";

default:
return "bg-gray-100 text-gray-500";

}

}

return(

<DashboardLayout>

<div>

<h1 className="text-3xl md:text-5xl font-bold text-[#8458B3] heading-font">

Program Timeline

</h1>

<p className="text-gray-500 mt-3">

Manage program schedules and live status

</p>

</div>

{/* FORM */}

<div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mt-10">

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

<input
placeholder="Program Name"
value={program}
onChange={(e)=>setProgram(e.target.value)}
className="border rounded-2xl p-4"
/>

<input
type="date"
value={date}
onChange={(e)=>setDate(e.target.value)}
className="border rounded-2xl p-4"
/>

<input
type="time"
value={time}
onChange={(e)=>setTime(e.target.value)}
className="border rounded-2xl p-4"
/>

<input
placeholder="Venue"
value={venue}
onChange={(e)=>setVenue(e.target.value)}
className="border rounded-2xl p-4"
/>

<select
value={status}
onChange={(e)=>setStatus(e.target.value)}
className="border rounded-2xl p-4"
>

<option>Upcoming</option>

<option>Ongoing</option>

<option>Completed</option>

<option>Postponed</option>

</select>

</div>

<button
onClick={addTimeline}
className="bg-[#8458B3] hover:bg-[#6f469a] transition text-white px-8 py-4 rounded-2xl mt-8"
>

Add Timeline

</button>

</div>

{/* TIMELINE LIST */}

<div className="space-y-6 mt-10">

{sortedTimeline.map((item)=>(

<div
key={item.id}
className="bg-white rounded-3xl shadow-xl p-6 border"
>

<div className="flex flex-col md:flex-row md:items-center gap-5">

<div className="flex-1">

<h2 className="text-2xl md:text-3xl font-bold text-[#8458B3]">

{item.program}

</h2>

<p className="mt-3 text-gray-500">

{item.date}

</p>

<p className="mt-2 text-gray-500">

{item.time}

</p>

<p className="mt-2">

{item.venue || "-"}

</p>

</div>

<div className="flex flex-col md:items-end gap-4">

<div
className={`px-5 py-3 rounded-2xl font-semibold ${getStatusColor(item.status)}`}
>

{item.status}

</div>

<button
onClick={()=>deleteTimeline(item.id)}
className="bg-red-100 text-red-500 px-5 py-3 rounded-2xl"
>

Delete

</button>

</div>

</div>

</div>

))}

</div>

</DashboardLayout>

)

}