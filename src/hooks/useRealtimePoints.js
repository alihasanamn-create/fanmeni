import { useEffect,useState } from "react";

import {
collection,
onSnapshot
} from "firebase/firestore";

import { db } from "../firebase";

export default function useRealtimePoints(){

const [artsTotals,setArtsTotals] = useState({});

const [sportsTotals,setSportsTotals] = useState({});

const [personalPoints,setPersonalPoints] = useState({});

const [loading,setLoading] = useState(true);

useEffect(()=>{

const unsubArts = onSnapshot(

collection(db,"arts_results"),

(snapshot)=>{

let teamTotals = {};

let personalTotals = {};

snapshot.forEach((doc)=>{

const result = doc.data();

const type = result.type;

const personalEligible =

type === "Individual" ||

type === "Personal Group";

if(result.positions){

Object.values(result.positions).forEach((winner)=>{

if(!winner) return;

const team = winner.team;

const points = Number(winner.points || 0);

if(!teamTotals[team]){

teamTotals[team] = 0;

}

teamTotals[team] += points;

if(personalEligible){

if(!personalTotals[winner.code]){

personalTotals[winner.code] = {

name:winner.name,

code:winner.code,

team:winner.team,

photo:winner.photo,

points:0

};

}

personalTotals[winner.code].points += points;

}

});

}

if(result.grades){

result.grades.forEach((g)=>{

if(!g) return;

const team = g.team;

const points = Number(g.points || 0);

if(!teamTotals[team]){

teamTotals[team] = 0;

}

teamTotals[team] += points;

if(personalEligible){

if(!personalTotals[g.code]){

personalTotals[g.code] = {

name:g.name,

code:g.code,

team:g.team,

photo:g.photo,

points:0

};

}

personalTotals[g.code].points += points;

}

});

}

});

setArtsTotals(teamTotals);

setPersonalPoints(personalTotals);

setLoading(false);

}

);

const unsubSports = onSnapshot(

collection(db,"sports_results"),

(snapshot)=>{

let totals = {};

snapshot.forEach((doc)=>{

const result = doc.data();

if(result.positions){

Object.values(result.positions).forEach((winner)=>{

if(!winner) return;

const team = winner.team;

const points = Number(winner.points || 0);

if(!totals[team]){

totals[team] = 0;

}

totals[team] += points;

});

}

if(result.grades){

result.grades.forEach((g)=>{

if(!g) return;

const team = g.team;

const points = Number(g.points || 0);

if(!totals[team]){

totals[team] = 0;

}

totals[team] += points;

});

}

});

setSportsTotals(totals);

}

);

return ()=>{

unsubArts();

unsubSports();

}

},[]);

return {

artsTotals,

sportsTotals,

personalPoints,

loading

};

}