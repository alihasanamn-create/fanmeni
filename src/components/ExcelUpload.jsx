import * as XLSX from "xlsx";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { calculatePoints } from "../utils/pointsCalculator";

export default function ExcelUpload({collectionName}){

async function handleFile(e){

const file = e.target.files[0];

const reader = new FileReader();

reader.onload = async (evt)=>{

const data = new Uint8Array(evt.target.result);

const workbook = XLSX.read(data,{type:"array"});

const sheet = workbook.Sheets[workbook.SheetNames[0]];

const rows = XLSX.utils.sheet_to_json(sheet);

if(collectionName==="results"){

const studentsSnap = await getDocs(collection(db,"students"));
const programsSnap = await getDocs(collection(db,"programs"));

const students = {};
const programs = {};

studentsSnap.forEach(doc=>{
const s = doc.data();
students[s.Code] = s;
});

programsSnap.forEach(doc=>{
const p = doc.data();
programs[p.ProgramCode] = p;
});

for(const r of rows){

const student = students[r.StudentCode];
const program = programs[r.ProgramCode];

if(!student || !program){
console.log("Invalid row",r);
continue;
}

const points = calculatePoints({
type: program.Category.toLowerCase(),
position: r.Position,
grade: r.Grade
});

await addDoc(collection(db,"results"),{

program: program.ProgramName,
programCode: program.ProgramCode,

student: student.Name,
studentCode: student.Code,

team: student.House,
category: student.Category,

position: r.Position || "",
grade: r.Grade || "",

points: points,

timestamp: Date.now()

});

}

}else{

for(const r of rows){
await addDoc(collection(db,collectionName),r);
}

}

alert("Upload completed");

};

reader.readAsArrayBuffer(file);

}

return(

<div className="bg-white shadow rounded p-6">

<h2 className="text-xl font-bold mb-3">

Upload {collectionName} Excel

</h2>

<input type="file" accept=".xlsx" onChange={handleFile}/>

</div>

)

}