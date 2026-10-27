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

export default function GalleryDashboard(){

const [title,setTitle] = useState("");

const [link,setLink] = useState("");

const [gallery,setGallery] = useState([]);

useEffect(()=>{

const unsub = onSnapshot(

collection(db,"gallery_links"),

(snapshot)=>{

setGallery(

snapshot.docs.map((doc)=>({

id:doc.id,
...doc.data()

}))

);

}

);

return ()=>unsub();

},[]);

async function addGallery(){

if(!title || !link) return;

await addDoc(

collection(db,"gallery_links"),

{
title,
link
}

);

setTitle("");
setLink("");

}

async function deleteGallery(id){

await deleteDoc(

doc(db,"gallery_links",id)

);

}

return(

<DashboardLayout>

<h1 className="text-5xl font-bold text-[#8458B3] heading-font">

Gallery Links

</h1>

<div className="bg-white rounded-3xl shadow-xl p-8 mt-10">

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

<input
placeholder="Gallery Title"
value={title}
onChange={(e)=>setTitle(e.target.value)}
className="border rounded-2xl p-4"
/>

<input
placeholder="Google Drive Link"
value={link}
onChange={(e)=>setLink(e.target.value)}
className="border rounded-2xl p-4"
/>

</div>

<button
onClick={addGallery}
className="bg-[#8458B3] text-white px-8 py-4 rounded-2xl mt-8"
>

Add Gallery

</button>

</div>

<div className="space-y-5 mt-10">

{gallery.map((g)=>(

<div
key={g.id}
className="bg-white rounded-3xl shadow p-6 flex items-center gap-5"
>

<div className="flex-1">

<h2 className="text-2xl font-bold">

{g.title}

</h2>

<p className="mt-2 text-blue-500 break-all">

{g.link}

</p>

</div>

<a
href={g.link}
target="_blank"
rel="noreferrer"
className="bg-[#8458B3] text-white px-5 py-3 rounded-xl"
>

Open

</a>

<button
onClick={()=>deleteGallery(g.id)}
className="bg-red-100 text-red-500 px-5 py-3 rounded-xl"
>

Delete

</button>

</div>

))}

</div>

</DashboardLayout>

)

}