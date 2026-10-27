import { useEffect,useState } from "react";

import {
collection,
query,
orderBy,
limit,
onSnapshot
} from "firebase/firestore";

import { db } from "../../firebase";

export default function LiveResultPopup(){

const [latest,setLatest] = useState(null);

const [visible,setVisible] = useState(false);

useEffect(()=>{

const q = query(

collection(db,"arts_results"),

orderBy("timestamp","desc"),

limit(1)

);

const unsub = onSnapshot(q,(snapshot)=>{

if(snapshot.empty) return;

const data = snapshot.docs[0].data();

setLatest(data);

setVisible(true);

setTimeout(()=>{

setVisible(false);

},10000);

});

return ()=>unsub();

},[]);

if(!latest || !visible) return null;

return(

<div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">

<div className="bg-white rounded-[40px] shadow-2xl w-[90%] max-w-4xl p-10 animate-popup border-[8px] border-[#8458B3]">

<div className="text-center">

<h1 className="text-5xl font-bold text-[#8458B3] heading-font">

🏆 RESULT PUBLISHED

</h1>

<h2 className="text-4xl font-bold mt-6">

{latest.program}

</h2>

<p className="text-gray-500 mt-3 text-xl">

{latest.category}

</p>

</div>

{/* POSITIONS */}

{latest.positions && (

<div className="grid grid-cols-3 gap-8 mt-12">

{/* FIRST */}

{latest.positions.first && (

<div className="bg-yellow-50 rounded-3xl p-6 text-center border border-yellow-200">

<img
src={latest.positions.first.photo}
alt="winner"
className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-yellow-300"
/>

<h2 className="text-3xl font-bold mt-5">

🥇 {latest.positions.first.name}

</h2>

<p className="mt-2">

{latest.positions.first.code}

</p>

<div className="bg-yellow-200 px-4 py-2 rounded-xl inline-block mt-4">

{latest.positions.first.team}

</div>

</div>

)}

{/* SECOND */}

{latest.positions.second && (

<div className="bg-gray-50 rounded-3xl p-6 text-center border">

<img
src={latest.positions.second.photo}
alt="winner"
className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-gray-300"
/>

<h2 className="text-3xl font-bold mt-5">

🥈 {latest.positions.second.name}

</h2>

<p className="mt-2">

{latest.positions.second.code}

</p>

<div className="bg-gray-200 px-4 py-2 rounded-xl inline-block mt-4">

{latest.positions.second.team}

</div>

</div>

)}

{/* THIRD */}

{latest.positions.third && (

<div className="bg-orange-50 rounded-3xl p-6 text-center border border-orange-200">

<img
src={latest.positions.third.photo}
alt="winner"
className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-orange-300"
/>

<h2 className="text-3xl font-bold mt-5">

🥉 {latest.positions.third.name}

</h2>

<p className="mt-2">

{latest.positions.third.code}

</p>

<div className="bg-orange-200 px-4 py-2 rounded-xl inline-block mt-4">

{latest.positions.third.team}

</div>

</div>

)}

</div>

)}

</div>

</div>

)

}