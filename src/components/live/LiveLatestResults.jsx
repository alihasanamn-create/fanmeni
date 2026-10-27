import { useEffect,useState } from "react";

import {
collection,
query,
orderBy,
limit,
onSnapshot
} from "firebase/firestore";

import { db } from "../../firebase";

export default function LiveLatestResults(){

const [results,setResults] = useState([]);

const [current,setCurrent] = useState(0);

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

useEffect(()=>{

if(results.length === 0) return;

const interval = setInterval(()=>{

setCurrent((prev)=>

prev === results.length - 1
? 0
: prev + 1

);

},5000);

return ()=>clearInterval(interval);

},[results]);

if(results.length === 0){

return(

<div className="bg-white rounded-3xl shadow-2xl p-10 text-center">

<h2 className="text-4xl font-bold text-gray-400">

Waiting for Results

</h2>

</div>

)

}

const r = results[current];

return(

<div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 h-full overflow-hidden">

<div className="flex justify-between items-center">

<h2 className="text-4xl font-bold text-[#8458B3] heading-font">

Latest Result

</h2>

<div className="bg-[#8458B3] text-white px-5 py-3 rounded-xl animate-pulse">

LIVE

</div>

</div>

{/* PROGRAM HEADER */}

<div className="text-center mt-8">

<h1 className="text-4xl md:text-5xl font-bold text-[#8458B3]">

{r.program}

</h1>

<p className="text-xl text-gray-500 mt-4">

{r.category}

</p>

</div>

{/* POSITION RESULTS */}

{r.positions && (

<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">

{/* FIRST */}

{r.positions.first && (

<div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-6 text-center">

<img
src={r.positions.first.photo}
alt="winner"
className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-yellow-300"
/>

<h2 className="text-3xl font-bold mt-5">

🥇 {r.positions.first.name}

</h2>

<p className="mt-3 text-lg">

{r.positions.first.code}

</p>

<div className="bg-yellow-200 px-5 py-3 rounded-xl inline-block mt-5">

{r.positions.first.team}

</div>

{r.positions.first.grade && (

<div className="bg-white px-5 py-3 rounded-xl inline-block mt-4 border">

Grade {r.positions.first.grade}

</div>

)}

</div>

)}

{/* SECOND */}

{r.positions.second && (

<div className="bg-gray-50 border rounded-3xl p-6 text-center">

<img
src={r.positions.second.photo}
alt="winner"
className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-gray-300"
/>

<h2 className="text-3xl font-bold mt-5">

🥈 {r.positions.second.name}

</h2>

<p className="mt-3 text-lg">

{r.positions.second.code}

</p>

<div className="bg-gray-200 px-5 py-3 rounded-xl inline-block mt-5">

{r.positions.second.team}

</div>

{r.positions.second.grade && (

<div className="bg-white px-5 py-3 rounded-xl inline-block mt-4 border">

Grade {r.positions.second.grade}

</div>

)}

</div>

)}

{/* THIRD */}

{r.positions.third && (

<div className="bg-orange-50 border border-orange-200 rounded-3xl p-6 text-center">

<img
src={r.positions.third.photo}
alt="winner"
className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-orange-300"
/>

<h2 className="text-3xl font-bold mt-5">

🥉 {r.positions.third.name}

</h2>

<p className="mt-3 text-lg">

{r.positions.third.code}

</p>

<div className="bg-orange-200 px-5 py-3 rounded-xl inline-block mt-5">

{r.positions.third.team}

</div>

{r.positions.third.grade && (

<div className="bg-white px-5 py-3 rounded-xl inline-block mt-4 border">

Grade {r.positions.third.grade}

</div>

)}

</div>

)}

</div>

)}

{/* GRADE HOLDERS */}

{r.grades?.length > 0 && (

<div className="mt-10">

<h2 className="text-3xl font-bold text-[#8458B3]">

Grade Holders

</h2>

<div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

{r.grades.map((g,index)=>(

<div
key={index}
className="bg-[#faf8ff] rounded-2xl p-5 flex items-center gap-5 border"
>

<img
src={g.photo}
alt="student"
className="w-16 h-16 rounded-full object-cover"
/>

<div>

<h2 className="text-2xl font-bold">

{g.name}

</h2>

<p className="text-gray-500 mt-1">

{g.code}

</p>

</div>

<div className="ml-auto bg-[#8458B3] text-white px-5 py-3 rounded-xl">

{g.grade}

</div>

</div>

))}

</div>

</div>

)}

{/* SLIDER INDICATORS */}

<div className="flex justify-center gap-3 mt-10">

{results.map((_,index)=>(

<div
key={index}
className={`h-3 rounded-full transition-all duration-300 ${
index === current
? "w-10 bg-[#8458B3]"
: "w-3 bg-gray-300"
}`}
/>

))}

</div>

</div>

)

}