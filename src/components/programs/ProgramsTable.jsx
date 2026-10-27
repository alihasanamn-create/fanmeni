import { useEffect,useState } from "react";

import {
collection,
onSnapshot,
deleteDoc,
doc
} from "firebase/firestore";

import { db } from "../../firebase";

export default function ProgramsTable({

collectionName,
themeColor,
title

}){

const [programs,setPrograms] = useState([]);

useEffect(()=>{

const unsub = onSnapshot(

collection(db,collectionName),

(snapshot)=>{

const data = snapshot.docs.map((doc)=>({

id:doc.id,
...doc.data()

}));

setPrograms(data);

}

);

return ()=>unsub();

},[collectionName]);

async function deleteProgram(id){

await deleteDoc(doc(db,collectionName,id));

}

return(

<div className="bg-white rounded-3xl shadow overflow-hidden mt-10">

<div className="p-4 md:p-6 border-b">

<h2
className="text-2xl md:text-4xl font-bold heading-font"
style={{
color:themeColor
}}
>

{title}

</h2>

</div>

<div className="overflow-x-auto">

<table className="w-full min-w-[800px]">

<thead
className="text-white"
style={{
background:themeColor
}}
>

<tr>

<th className="p-4">Code</th>
<th>Name</th>
<th>Category</th>
<th>Type</th>
<th>Participants</th>
<th>Delete</th>

</tr>

</thead>

<tbody>

{programs.map((p)=>(

<tr
key={p.id}
className="border-b hover:bg-[#faf8ff]"
>

<td className="p-4">

{p.ProgramCode}

</td>

<td>

{p.ProgramName}

</td>

<td>

{p.Category}

</td>

<td>

{p.Type}

</td>

<td>

{p.ParticipantCount}

</td>

<td>

<button
onClick={()=>deleteProgram(p.id)}
className="bg-red-100 text-red-500 px-4 py-2 rounded-lg"
>

Delete

</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

)

}