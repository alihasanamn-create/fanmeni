import { useEffect,useState } from "react";

import {
collection,
onSnapshot
} from "firebase/firestore";

import { db } from "../firebase";

import PublicNavbar from "../components/layout/PublicNavbar";

export default function TimelinePage(){

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

const sortedTimeline = [...timeline].sort((a,b)=>{

const first = new Date(`${a.date} ${a.time}`);

const second = new Date(`${b.date} ${b.time}`);

return first - second;

});

return(

<div className="bg-[#f6f7fb] min-h-screen">

<PublicNavbar/>

<div className="max-w-6xl mx-auto p-4 md:p-8">

<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

<div>

<h1 className="text-4xl md:text-6xl font-bold text-[#8458B3] heading-font">

Program Timeline

</h1>

<p className="text-gray-500 mt-3">

Realtime FANMENI 26 schedule

</p>

</div>

<div className="bg-[#8458B3] text-white px-6 py-4 rounded-2xl">

LIVE

</div>

</div>

<div className="space-y-6 mt-10">

{sortedTimeline.map((item)=>(

<div
key={item.id}
className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border-l-[10px] border-[#8458B3]"
>

<div className="flex flex-col md:flex-row md:items-center gap-6">

<div className="flex-1">

<h2 className="text-2xl md:text-3xl font-bold text-[#8458B3]">

{item.program}

</h2>

<p className="mt-4 text-lg text-gray-500">

{item.date}

</p>

<p className="mt-2 text-lg text-gray-500">

{item.time}

</p>

<p className="mt-2 text-lg">

{item.venue || "-"}

</p>

</div>

<div
className={`px-6 py-4 rounded-2xl font-semibold text-lg ${getStatusColor(item.status)}`}
>

{item.status}

</div>

</div>

</div>

))}

</div>

</div>

</div>

)

}