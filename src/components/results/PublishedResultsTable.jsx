import { useEffect,useState } from "react";

import {
collection,
onSnapshot,
deleteDoc,
doc
} from "firebase/firestore";

import { db } from "../../firebase";

export default function PublishedResultsTable({

collectionName,
title,
themeColor

}){

const [results,setResults] = useState([]);

useEffect(()=>{

const unsub = onSnapshot(

collection(db,collectionName),

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

},[collectionName]);

async function deleteResult(id){

const confirmDelete = window.confirm(

"Delete this result?"

);

if(!confirmDelete) return;

await deleteDoc(

doc(db,collectionName,id)

);

alert("Result Deleted");

}

return(

<div className="bg-white rounded-3xl shadow p-4 md:p-8 mt-10 overflow-hidden">

<h2
className="text-3xl md:text-4xl font-bold heading-font"
style={{
color:themeColor
}}
>

{title}

</h2>

<div className="overflow-x-auto mt-8">

<table className="w-full min-w-[900px]">

<thead
style={{
background:themeColor
}}
className="text-white"
>

<tr>

<th className="p-4 text-left">

Program

</th>

<th className="text-left">

Category

</th>

<th className="text-left">

Mode

</th>

<th className="text-left">

First

</th>

<th className="text-left">

Second

</th>

<th className="text-left">

Third

</th>

<th className="text-left">

Actions

</th>

</tr>

</thead>

<tbody>

{results.map((r)=>(

<tr
key={r.id}
className="border-b hover:bg-[#faf8ff]"
>

<td className="p-4 font-semibold">

{r.program}

</td>

<td>

{r.category}

</td>

<td>

{r.resultMode}

</td>

<td>

{r.positions?.first?.name || "-"}

</td>

<td>

{r.positions?.second?.name || "-"}

</td>

<td>

{r.positions?.third?.name || "-"}

</td>

<td>

<div className="flex gap-3">

<button
onClick={()=>
window.location.href=
`/edit-result/${collectionName}/${r.id}`
}
className="bg-blue-100 text-blue-600 px-4 py-2 rounded-xl"
>

Edit

</button>

<button
onClick={()=>deleteResult(r.id)}
className="bg-red-100 text-red-500 px-4 py-2 rounded-xl"
>

Delete

</button>

</div>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

)

}