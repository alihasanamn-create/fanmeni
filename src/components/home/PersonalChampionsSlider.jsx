import useRealtimePoints from "../../hooks/useRealtimePoints";

import { useEffect,useState } from "react";

import {
collection,
onSnapshot
} from "firebase/firestore";

import { db } from "../../firebase";

export default function PersonalChampionsSlider(){

const {

personalPoints

} = useRealtimePoints();

const [students,setStudents] = useState([]);

useEffect(()=>{

const unsub = onSnapshot(

collection(db,"students"),

(snapshot)=>{

setStudents(

snapshot.docs.map((doc)=>({

id:doc.id,
...doc.data()

}))

);

}

);

return ()=>unsub();

},[]);

const champions = Object.values(personalPoints)

.sort((a,b)=>b.points - a.points);

function topper(category){

return champions

.filter((c)=>{

const student = students.find(

(s)=>s.code === c.code

);

return student?.category === category;

})[0];

}

const bidayaTopper = topper("Bidaya");

const thaniyaTopper = topper("Thaniya");

const fanmeniTopper = champions[0];

const cards = [

{
title:"Bidaya Topper",
data:bidayaTopper,
color:"from-[#8458B3] to-[#a28089]"
},

{
title:"Thaniya Topper",
data:thaniyaTopper,
color:"from-[#4b83ff] to-[#6fa7ff]"
},

{
title:"Fanmeni Topper",
data:fanmeniTopper,
color:"from-[#ff9f43] to-[#ffb976]"
}

];

return(

<div className="grid grid-cols-1 gap-5">

{cards.map((card,index)=>(

<div
key={index}
className={`bg-gradient-to-r ${card.color} rounded-3xl shadow-xl p-5 text-white overflow-hidden`}
>

<h2 className="text-lg md:text-xl font-bold heading-font text-center leading-tight">

{card.title}

</h2>

{card.data ? (

<>

<img
src={card.data.photo}
alt="champion"
className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover mx-auto mt-5 border-4 border-white"
/>

<h1 className="text-xl md:text-2xl font-bold text-center mt-4 break-words leading-tight">

{card.data.name}

</h1>

<p className="text-center mt-1 text-sm md:text-base">

{card.data.code}

</p>

<h2 className="text-4xl md:text-5xl font-bold text-center mt-5">

{card.data.points}

</h2>

<p className="text-center text-sm mt-1">

Points

</p>

</>

) : (

<p className="mt-6 text-center text-sm">

Waiting for Results

</p>

)}

</div>

))}

</div>

)

}