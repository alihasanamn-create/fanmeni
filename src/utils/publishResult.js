import {
addDoc,
collection
} from "firebase/firestore";

import { db } from "../firebase";

export async function publishResult(data){

await addDoc(

collection(db,"arts_results"),

{

...data,

timestamp:Date.now()

}

);

}