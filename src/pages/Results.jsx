import { useEffect,useState } from "react";

import {
collection,
onSnapshot
} from "firebase/firestore";

import { db } from "../firebase";

export default function Results(){

const [results,setResults] = useState([]);

useEffect(()=>{

const unsub = onSnapshot(

collection(db,"results"),

(snapshot)=>{

setResults(

snapshot.docs.map((doc)=>({
id:doc.id,
...doc.data()
}))

);

}

);

return ()=>unsub();

},[]);

const sortedResults = [...results].sort((a,b)=>{

return (

new Date(b.createdAt?.seconds * 1000)

-

new Date(a.createdAt?.seconds * 1000)

);

});

return(

<div className="min-h-screen bg-[#f6f7fb] p-4 md:p-8">

{/* HEADER */}

<div className="text-center">

<h1 className="text-4xl md:text-6xl font-black text-[#8458B3]">

FANMENI RESULTS

</h1>

<p className="text-gray-500 mt-4 text-lg">

Live Published Results

</p>

</div>

{/* RESULTS */}

<div className="space-y-8 mt-12">

{sortedResults.map((result)=>(

<div
key={result.id}
className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border"
>

{/* TOP */}

<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

<div>

<h2 className="text-3xl font-bold text-[#8458B3]">

{result.program}

</h2>

<p className="text-gray-500 mt-2">

{result.category}

</p>

<p className="mt-2">

{result.type}

</p>

</div>

<div className="bg-[#8458B3] text-white px-5 py-3 rounded-2xl font-semibold">

{result.resultType
?.replaceAll("_"," ")
?.toUpperCase()}

</div>

</div>

{/* POSITIONS */}

{result.resultType !== "grades_only" && (

<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">

{/* FIRST */}

<div className="bg-yellow-50 border rounded-3xl p-5">

<h3 className="text-yellow-600 font-bold text-2xl">

1st Place

</h3>

<p className="mt-4 text-xl font-semibold">

{result.positions?.first || "-"}

</p>

</div>

{/* SECOND */}

<div className="bg-gray-100 border rounded-3xl p-5">

<h3 className="text-gray-600 font-bold text-2xl">

2nd Place

</h3>

<p className="mt-4 text-xl font-semibold">

{result.positions?.second || "-"}

</p>

</div>

{/* THIRD */}

<div className="bg-orange-50 border rounded-3xl p-5">

<h3 className="text-orange-600 font-bold text-2xl">

3rd Place

</h3>

<p className="mt-4 text-xl font-semibold">

{result.positions?.third || "-"}

</p>

</div>

</div>

)}

{/* GRADES */}

{result.resultType === "positions_grades" && (

<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

<div className="bg-[#faf8ff] border rounded-3xl p-5">

<h3 className="text-[#8458B3] font-bold">

1st Grade

</h3>

<p className="mt-3 text-2xl font-bold">

{result.firstGrade || "-"}

</p>

</div>

<div className="bg-[#faf8ff] border rounded-3xl p-5">

<h3 className="text-[#8458B3] font-bold">

2nd Grade

</h3>

<p className="mt-3 text-2xl font-bold">

{result.secondGrade || "-"}

</p>

</div>

<div className="bg-[#faf8ff] border rounded-3xl p-5">

<h3 className="text-[#8458B3] font-bold">

3rd Grade

</h3>

<p className="mt-3 text-2xl font-bold">

{result.thirdGrade || "-"}

</p>

</div>

</div>

)}

{/* ADDITIONAL */}

{result.additionalGrades?.length > 0 && (

<div className="mt-10">

<h2 className="text-2xl font-bold text-[#8458B3]">

Additional Grades

</h2>

<div className="space-y-4 mt-5">

{result.additionalGrades.map((item,index)=>(

<div
key={index}
className="bg-[#faf8ff] border rounded-2xl p-5 flex items-center justify-between"
>

<p className="font-semibold">

{item.name}

</p>

<p className="text-[#8458B3] text-2xl font-black">

{item.grade}

</p>

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