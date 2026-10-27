import { useEffect,useState } from "react";

import {
collection,
onSnapshot
} from "firebase/firestore";

import { db } from "../firebase";

export default function useTeamTotals(){

const [totals,setTotals] = useState({});

useEffect(()=>{

const unsub = onSnapshot(

collection(db,"arts_results"),

(snapshot)=>{

let data = {};

snapshot.forEach((doc)=>{

const r = doc.data();

if(!data[r.team]){
data[r.team] = 0;
}

data[r.team] += Number(r.points || 0);

});

setTotals(data);

}

);

return ()=>unsub();

},[]);

return totals;

}