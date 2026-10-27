import { useEffect,useState } from "react";

import {
collection,
onSnapshot,
addDoc
} from "firebase/firestore";

import { db } from "../../firebase";

import calculatePoints from "../../utils/calculatePoints";

export default function PublishResultForm(){

const [department,setDepartment] = useState("arts");

const [programs,setPrograms] = useState([]);

const [students,setStudents] = useState([]);

const [candidates,setCandidates] = useState([]);

const [selectedProgram,setSelectedProgram] = useState("");

const [resultMode,setResultMode] = useState("position");

const [first,setFirst] = useState("");
const [second,setSecond] = useState("");
const [third,setThird] = useState("");

const [firstGrade,setFirstGrade] = useState("");
const [secondGrade,setSecondGrade] = useState("");
const [thirdGrade,setThirdGrade] = useState("");

const [gradeStudents,setGradeStudents] = useState([
{
name:"",
grade:""
}
]);

useEffect(()=>{

const programCollection =

department === "arts"
? "arts_programs"
: "sports_programs";

const candidateCollection =

department === "arts"
? "arts_candidates"
: "sports_candidates";

const unsubPrograms = onSnapshot(

collection(db,programCollection),

(snapshot)=>{

const data = snapshot.docs.map((doc)=>({

id:doc.id,
...doc.data()

}));

setPrograms(data);

}

);

const unsubStudents = onSnapshot(

collection(db,"students"),

(snapshot)=>{

const data = snapshot.docs.map((doc)=>({

id:doc.id,
...doc.data()

}));

setStudents(data);

}

);

const unsubCandidates = onSnapshot(

collection(db,candidateCollection),

(snapshot)=>{

const data = snapshot.docs.map((doc)=>({

id:doc.id,
...doc.data()

}));

setCandidates(data);

}

);

return ()=>{

unsubPrograms();
unsubStudents();
unsubCandidates();

}

},[department]);

const programData = programs.find(

(p)=>p.ProgramName === selectedProgram

);

const candidateData = candidates.find(

(c)=>c.program === selectedProgram

);

let allowedNames = [];

if(candidateData){

allowedNames = [

...(candidateData.teamA || []),

...(candidateData.teamB || [])

];

}

const allowedStudents = students.filter(

(s)=>{

if(programData?.Category === "Bidaya"){

return (
allowedNames.includes(s.name) &&
s.category === "Bidaya"
);

}

if(programData?.Category === "Thaniya"){

return (
allowedNames.includes(s.name) &&
s.category === "Thaniya"
);

}

if(programData?.Category === "General"){

return allowedNames.includes(s.name);

}

return false;

}

);

function getStudent(name){

return students.find((s)=>s.name === name);

}

function buildPosition(studentName,position,grade){

const student = getStudent(studentName);

if(!student) return null;

return {

name:student.name,

code:student.code,

team:student.team,

photo:student.photo,

grade,

points:calculatePoints({

programType:programData?.Type,

position,

grade,

includePosition:true,

includeGrade:resultMode === "position-grade"

})

}

}

function addGradeField(){

setGradeStudents([

...gradeStudents,

{
name:"",
grade:""
}

]);

}

function updateGradeField(index,key,value){

const updated = [...gradeStudents];

updated[index][key] = value;

setGradeStudents(updated);

}

async function handleSubmit(e){

e.preventDefault();

if(!programData){

alert("Select Program");

return;

}

const resultCollection =

department === "arts"
? "arts_results"
: "sports_results";

let payload = {

program:programData.ProgramName,

programCode:programData.ProgramCode,

category:programData.Category,

type:programData.Type,

resultMode,

timestamp:Date.now()

};

if(

resultMode === "position" ||

resultMode === "position-grade"

){

payload.positions = {

first:buildPosition(

first,
1,
firstGrade

),

second:buildPosition(

second,
2,
secondGrade

),

third:buildPosition(

third,
3,
thirdGrade

)

};

}

payload.grades = gradeStudents

.filter((g)=>g.name && g.grade)

.map((g)=>{

const student = getStudent(g.name);

return {

name:student?.name,

code:student?.code,

team:student?.team,

photo:student?.photo,

grade:g.grade,

points:calculatePoints({

programType:programData?.Type,

grade:g.grade,

includePosition:false,

includeGrade:true

})

}

});

await addDoc(

collection(db,resultCollection),

payload

);

alert("Result Published Successfully");

setSelectedProgram("");

setFirst("");
setSecond("");
setThird("");

setFirstGrade("");
setSecondGrade("");
setThirdGrade("");

setGradeStudents([
{
name:"",
grade:""
}
]);

}

return(

<form
onSubmit={handleSubmit}
className="bg-white rounded-3xl shadow p-4 md:p-8"
>

<h2 className="text-3xl md:text-4xl font-bold text-[#8458B3] heading-font">

Publish Result

</h2>

<div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">

{/* DEPARTMENT */}

<select
value={department}
onChange={(e)=>setDepartment(e.target.value)}
className="border rounded-xl px-4 py-3"
>

<option value="arts">

Arts

</option>

<option value="sports">

Riyadha

</option>

</select>

{/* PROGRAM */}

<select
value={selectedProgram}
onChange={(e)=>setSelectedProgram(e.target.value)}
className="border rounded-xl px-4 py-3"
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

{/* RESULT MODE */}

<select
value={resultMode}
onChange={(e)=>setResultMode(e.target.value)}
className="border rounded-xl px-4 py-3"
>

<option value="position">

Position Only

</option>

<option value="position-grade">

Position + Grades

</option>

<option value="grade-only">

Grade Only

</option>

</select>

</div>

{/* POSITION RESULTS */}

{resultMode !== "grade-only" && (

<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">

{/* FIRST */}

<div className="bg-yellow-50 rounded-3xl p-6 border border-yellow-200">

<h2 className="text-2xl font-bold text-yellow-600">

🥇 First Place

</h2>

<select
value={first}
onChange={(e)=>setFirst(e.target.value)}
className="border rounded-xl px-4 py-3 w-full mt-6"
>

<option value="">

Select Candidate

</option>

{allowedStudents.map((s)=>(

<option
key={s.id}
value={s.name}
>

{s.code} - {s.name}

</option>

))}

</select>

{resultMode === "position-grade" && (

<select
value={firstGrade}
onChange={(e)=>setFirstGrade(e.target.value)}
className="border rounded-xl px-4 py-3 w-full mt-4"
>

<option value="">

Select Grade

</option>

<option>A</option>
<option>B</option>
<option>C</option>

</select>

)}

</div>

{/* SECOND */}

<div className="bg-gray-50 rounded-3xl p-6 border">

<h2 className="text-2xl font-bold text-gray-600">

🥈 Second Place

</h2>

<select
value={second}
onChange={(e)=>setSecond(e.target.value)}
className="border rounded-xl px-4 py-3 w-full mt-6"
>

<option value="">

Select Candidate

</option>

{allowedStudents.map((s)=>(

<option
key={s.id}
value={s.name}
>

{s.code} - {s.name}

</option>

))}

</select>

{resultMode === "position-grade" && (

<select
value={secondGrade}
onChange={(e)=>setSecondGrade(e.target.value)}
className="border rounded-xl px-4 py-3 w-full mt-4"
>

<option value="">

Select Grade

</option>

<option>A</option>
<option>B</option>
<option>C</option>

</select>

)}

</div>

{/* THIRD */}

<div className="bg-orange-50 rounded-3xl p-6 border border-orange-200">

<h2 className="text-2xl font-bold text-orange-500">

🥉 Third Place

</h2>

<select
value={third}
onChange={(e)=>setThird(e.target.value)}
className="border rounded-xl px-4 py-3 w-full mt-6"
>

<option value="">

Select Candidate

</option>

{allowedStudents.map((s)=>(

<option
key={s.id}
value={s.name}
>

{s.code} - {s.name}

</option>

))}

</select>

{resultMode === "position-grade" && (

<select
value={thirdGrade}
onChange={(e)=>setThirdGrade(e.target.value)}
className="border rounded-xl px-4 py-3 w-full mt-4"
>

<option value="">

Select Grade

</option>

<option>A</option>
<option>B</option>
<option>C</option>

</select>

)}

</div>

</div>

)}

{/* GRADE SECTION */}

<div className="bg-[#faf8ff] rounded-3xl p-6 mt-10 border">

<h2 className="text-3xl font-bold text-[#8458B3] heading-font">

Additional Grades

</h2>

<div className="space-y-5 mt-6">

{gradeStudents.map((g,index)=>(

<div
key={index}
className="grid grid-cols-1 md:grid-cols-2 gap-4"
>

<select
value={g.name}
onChange={(e)=>
updateGradeField(
index,
"name",
e.target.value
)
}
className="border rounded-xl px-4 py-3"
>

<option value="">

Select Candidate

</option>

{allowedStudents.map((s)=>(

<option
key={s.id}
value={s.name}
>

{s.code} - {s.name}

</option>

))}

</select>

<select
value={g.grade}
onChange={(e)=>
updateGradeField(
index,
"grade",
e.target.value
)
}
className="border rounded-xl px-4 py-3"
>

<option value="">

Select Grade

</option>

<option>A</option>
<option>B</option>
<option>C</option>

</select>

</div>

))}

</div>

<button
type="button"
onClick={addGradeField}
className="bg-[#8458B3] text-white px-5 py-3 rounded-xl mt-6"
>

Add More Grade

</button>

</div>

<button className="bg-[#8458B3] text-white px-8 py-4 rounded-xl mt-10">

Publish Result

</button>

</form>

)

}