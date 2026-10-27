import { useEffect,useState } from "react";

import {
collection,
query,
orderBy,
limit,
onSnapshot
} from "firebase/firestore";

import { db } from "../../firebase";

export default function LatestResultsSlider(){

const [results,setResults] = useState([]);

useEffect(()=>{

const q = query(

collection(db,"arts_results"),

orderBy("timestamp","desc"),

limit(10)

);

const unsub = onSnapshot(q,(snapshot)=>{

setResults(

snapshot.docs.map((doc)=>({

id:doc.id,
...doc.data()

}))

);

});

return ()=>unsub();

},[]);

function renderPositionCard(position,emoji,color){

if(!position){

return(

<div className="bg-gray-50 rounded-3xl p-6 text-center">

<p>No Result</p>

</div>

)

}

return(

<div className={`${color} rounded-3xl p-6 text-center`}>

<img
src={position.photo}
alt="winner"
className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white"
/>

<h2 className="text-2xl font-bold mt-5">

{emoji} {position.name}

</h2>

<p className="mt-2">

{position.code}

</p>

<p className="mt-2">

{position.team}

</p>

{position.grade && (

<div className="bg-white px-4 py-2 rounded-xl inline-block mt-5">

Grade {position.grade}

</div>

)}

</div>

)

}

return(

<div className="bg-white rounded-3xl shadow p-4 md:p-8">

<div className="flex justify-between items-center">

<h2 className="text-3xl md:text-4xl font-bold text-[#8458B3] heading-font">

Latest Results

</h2>

<div className="bg-[#8458B3] text-white px-5 py-3 rounded-xl">

Live

</div>

</div>

<div className="space-y-8 mt-10">

{results.map((r)=>(

<div
key={r.id}
className="border rounded-3xl p-4 md:p-8"
>

<div className="flex flex-col md:flex-row justify-between md:items-center gap-4">

<div>

<h2 className="text-2xl md:text-3xl font-bold text-[#8458B3]">

{r.program}

</h2>

<p className="text-gray-500 mt-2">

{r.category}

</p>

</div>

<div className="bg-[#f3efff] px-5 py-3 rounded-xl">

{r.resultMode}

</div>

</div>

{/* POSITION RESULTS */}

{r.positions && (

<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

{renderPositionCard(

r.positions.first,
"🥇",
"bg-yellow-50 border border-yellow-200"
)}

{renderPositionCard(

r.positions.second,
"🥈",
"bg-gray-50 border"
)}

{renderPositionCard(

r.positions.third,
"🥉",
"bg-orange-50 border border-orange-200"
)}

</div>

)}

{/* GRADE RESULTS */}

{r.grades?.length > 0 && (

<div className="mt-8">

<h2 className="text-2xl font-bold text-[#8458B3]">

Grades

</h2>

<div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">

{r.grades.map((g,index)=>(

<div
key={index}
className="bg-[#faf8ff] rounded-2xl p-5 flex items-center gap-5"
>

<img
src={g.photo}
alt="student"
className="w-16 h-16 rounded-full object-cover"
/>

<div>

<h2 className="text-xl font-bold">

{g.name}

</h2>

<p className="text-gray-500">

{g.code}

</p>

</div>

<div className="ml-auto bg-[#8458B3] text-white px-4 py-2 rounded-xl">

{g.grade}

</div>

</div>

))}

</div>

</div>

)}

</div>

))}

</div>

</div>

)

}