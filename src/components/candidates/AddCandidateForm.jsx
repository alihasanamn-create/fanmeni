import { useEffect,useState } from "react";

import {
collection,
onSnapshot,
addDoc
} from "firebase/firestore";

import { db } from "../../firebase";

export default function AddCandidateForm({

programCollection,
candidateCollection,
themeColor,
title

}){

const [programs,setPrograms] = useState([]);

const [students,setStudents] = useState([]);

const [selectedProgram,setSelectedProgram] = useState("");

const [teamA,setTeamA] = useState([""]);

const [teamB,setTeamB] = useState([""]);

const [blueTeams,setBlueTeams] = useState([
{
teamName:"Blue A",
participants:[""]
}
]);

const [greenTeams,setGreenTeams] = useState([
{
teamName:"Green A",
participants:[""]
}
]);

useEffect(()=>{

const unsubPrograms = onSnapshot(

collection(db,programCollection),

(snapshot)=>{

setPrograms(

snapshot.docs.map((doc)=>({
id:doc.id,
...doc.data()
}))

);

}

);

const unsubStudents = onSnapshot(

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

return ()=>{

unsubPrograms();
unsubStudents();

}

},[programCollection]);

const programData = programs.find(

(p)=>p.ProgramName === selectedProgram

);

const participantCount = Number(

programData?.ParticipantCount || 1

);

const category = programData?.Category;

function allowedStudents(team){

return students.filter((s)=>{

const categoryMatch =

category === "General"
? true
: s.category === category;

return (
s.team === team &&
categoryMatch
);

});

}

// Reset the slot arrays when the participant count or program changes.
// Done during render (React's "adjusting state when props change" pattern) so the
// arrays are correct in the same pass instead of after an extra commit.

const slotKey = `${programData?.id ?? ""}|${programData?.Type ?? ""}|${participantCount}`;

const [prevSlotKey, setPrevSlotKey] = useState(slotKey);

if(prevSlotKey !== slotKey){

setPrevSlotKey(slotKey);

if(programData?.Type !== "General"){

setTeamA(

Array(participantCount).fill("")

);

setTeamB(

Array(participantCount).fill("")

);

}

}

function updateTeam(team,index,value){

let updated = [...team];

updated[index] = value;

const unique = new Set(

updated.filter(Boolean)

);

if(unique.size !== updated.filter(Boolean).length){

alert("Duplicate Candidate Not Allowed");

return;

}

if(team === teamA){

setTeamA(updated);

}else{

setTeamB(updated);

}

}

function addBlueTeam(){

setBlueTeams([

...blueTeams,

{
teamName:`Blue ${String.fromCharCode(65 + blueTeams.length)}`,
participants:Array(participantCount).fill("")
}

]);

}

function addGreenTeam(){

setGreenTeams([

...greenTeams,

{
teamName:`Green ${String.fromCharCode(65 + greenTeams.length)}`,
participants:Array(participantCount).fill("")
}

]);

}

function updateGeneralTeam(

teams,
setTeams,
teamIndex,
participantIndex,
value

){

const updated = [...teams];

updated[teamIndex].participants[participantIndex] = value;

setTeams(updated);

}

async function handleSubmit(e){

e.preventDefault();

if(!programData){

alert("Select Program");

return;

}

let payload = {

program:programData.ProgramName,

programCode:programData.ProgramCode,

category:programData.Category,

type:programData.Type,

timestamp:Date.now()

};

if(programData.Type === "General"){

payload.blueTeams = blueTeams;

payload.greenTeams = greenTeams;

}else{

payload.teamA = teamA.filter(Boolean);

payload.teamB = teamB.filter(Boolean);

}

await addDoc(

collection(db,candidateCollection),

payload

);

alert("Candidates Assigned");

}

return(

<form
onSubmit={handleSubmit}
className="bg-white rounded-3xl shadow p-4 md:p-8 mt-10"
>

<h2
className="text-3xl md:text-4xl font-bold heading-font"
style={{
color:themeColor
}}
>

{title}

</h2>

<select
value={selectedProgram}
onChange={(e)=>setSelectedProgram(e.target.value)}
className="border rounded-xl px-4 py-3 w-full mt-8"
>

<option value="">

Select Program

</option>

{programs.map((p)=>(

<option
key={p.id}
value={p.ProgramName}
>

{p.ProgramName}

</option>

))}

</select>

{/* GENERAL PROGRAMS */}

{programData?.Type === "General" ? (

<div className="space-y-10 mt-10">

{/* BLUE TEAMS */}

<div className="bg-blue-50 rounded-3xl p-6">

<div className="flex justify-between items-center">

<h2 className="text-3xl font-bold text-blue-600">

Blue Teams

</h2>

<button
type="button"
onClick={addBlueTeam}
className="bg-blue-600 text-white px-5 py-3 rounded-xl"
>

Add Team

</button>

</div>

<div className="space-y-8 mt-8">

{blueTeams.map((team,teamIndex)=>(

<div
key={teamIndex}
className="bg-white rounded-2xl p-5"
>

<h2 className="text-2xl font-bold">

{team.teamName}

</h2>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">

{team.participants.map((_,participantIndex)=>(

<select
key={participantIndex}
value={team.participants[participantIndex]}
onChange={(e)=>
updateGeneralTeam(
blueTeams,
setBlueTeams,
teamIndex,
participantIndex,
e.target.value
)
}
className="border rounded-xl px-4 py-3"
>

<option value="">

Select Participant

</option>

{allowedStudents("Blue").map((s)=>(

<option
key={s.id}
value={s.name}
>

{s.code} - {s.name}

</option>

))}

</select>

))}

</div>

</div>

))}

</div>

</div>

{/* GREEN TEAMS */}

<div className="bg-green-50 rounded-3xl p-6">

<div className="flex justify-between items-center">

<h2 className="text-3xl font-bold text-green-600">

Green Teams

</h2>

<button
type="button"
onClick={addGreenTeam}
className="bg-green-600 text-white px-5 py-3 rounded-xl"
>

Add Team

</button>

</div>

<div className="space-y-8 mt-8">

{greenTeams.map((team,teamIndex)=>(

<div
key={teamIndex}
className="bg-white rounded-2xl p-5"
>

<h2 className="text-2xl font-bold">

{team.teamName}

</h2>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">

{team.participants.map((_,participantIndex)=>(

<select
key={participantIndex}
value={team.participants[participantIndex]}
onChange={(e)=>
updateGeneralTeam(
greenTeams,
setGreenTeams,
teamIndex,
participantIndex,
e.target.value
)
}
className="border rounded-xl px-4 py-3"
>

<option value="">

Select Participant

</option>

{allowedStudents("Green").map((s)=>(

<option
key={s.id}
value={s.name}
>

{s.code} - {s.name}

</option>

))}

</select>

))}

</div>

</div>

))}

</div>

</div>

</div>

) : (

<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">

{/* BLUE */}

<div className="bg-blue-50 rounded-3xl p-6">

<h2 className="text-3xl font-bold text-blue-600">

Blue Team

</h2>

<div className="space-y-4 mt-6">

{teamA.map((value,index)=>(

<select
key={index}
value={value}
onChange={(e)=>
updateTeam(
teamA,
index,
e.target.value
)
}
className="border rounded-xl px-4 py-3 w-full"
>

<option value="">

Participant {index + 1}

</option>

{allowedStudents("Blue").map((s)=>(

<option
key={s.id}
value={s.name}
>

{s.code} - {s.name}

</option>

))}

</select>

))}

</div>

</div>

{/* GREEN */}

<div className="bg-green-50 rounded-3xl p-6">

<h2 className="text-3xl font-bold text-green-600">

Green Team

</h2>

<div className="space-y-4 mt-6">

{teamB.map((value,index)=>(

<select
key={index}
value={value}
onChange={(e)=>
updateTeam(
teamB,
index,
e.target.value
)
}
className="border rounded-xl px-4 py-3 w-full"
>

<option value="">

Participant {index + 1}

</option>

{allowedStudents("Green").map((s)=>(

<option
key={s.id}
value={s.name}
>

{s.code} - {s.name}

</option>

))}

</select>

))}

</div>

</div>

</div>

)}

<button
className="text-white px-8 py-4 rounded-xl mt-10"
style={{
background:themeColor
}}
>

Save Candidates

</button>

</form>

)

}