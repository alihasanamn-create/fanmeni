import { useEffect,useState } from "react";

import {
collection,
onSnapshot
} from "firebase/firestore";

import { db } from "../firebase";

import PublicNavbar from "../components/layout/PublicNavbar";

export default function GalleryPage(){

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

return(

<div className="bg-[#f6f7fb] min-h-screen">

<PublicNavbar/>

<div className="max-w-6xl mx-auto p-4 md:p-8">

<h1 className="text-5xl font-bold text-[#8458B3] heading-font">

Gallery

</h1>

<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">

{gallery.map((g)=>(

<a
key={g.id}
href={g.link}
target="_blank"
rel="noreferrer"
className="bg-white rounded-3xl shadow-xl p-8 hover:scale-[1.02] transition block"
>

<h2 className="text-3xl font-bold text-[#8458B3]">

{g.title}

</h2>

<p className="mt-4 text-gray-500">

Open Google Drive Album

</p>

</a>

))}

</div>

</div>

</div>

)

}