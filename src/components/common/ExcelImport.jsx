import * as XLSX from "xlsx";

import {
collection,
addDoc
} from "firebase/firestore";

import { db } from "../../firebase";

export default function ExcelImport({

collectionName,
buttonText

}){

async function handleFileUpload(e){

try{

const file = e.target.files[0];

if(!file){

alert("No File Selected");

return;

}

const reader = new FileReader();

reader.onload = async(evt)=>{

try{

const data = evt.target.result;

const workbook = XLSX.read(data,{

type:"binary"

});

const sheetName = workbook.SheetNames[0];

const sheet = workbook.Sheets[sheetName];

const jsonData = XLSX.utils.sheet_to_json(sheet,{

defval:""

});

console.log(jsonData);

if(jsonData.length===0){

alert("Excel is Empty");

return;

}

for(const row of jsonData){

await addDoc(

collection(db,collectionName),

{

...row

}

);

}

alert("Excel Imported Successfully");

}catch(error){

console.error(error);

alert("Import Failed");

}

};

reader.readAsBinaryString(file);

}catch(error){

console.error(error);

alert("Something Went Wrong");

}

}

return(

<div className="bg-white rounded-3xl shadow p-6 md:p-8 h-fit">

<h2 className="text-2xl md:text-3xl font-bold text-[#8458B3] heading-font">

Excel Import

</h2>

<p className="text-gray-500 mt-3 text-sm md:text-base">

Upload .xlsx or .xls files directly into database

</p>

<label className="block mt-8">

<div className="bg-[#8458B3] hover:bg-[#6f469a] transition text-white px-6 py-4 rounded-2xl text-center cursor-pointer font-semibold">

{buttonText}

</div>

<input
type="file"
accept=".xlsx,.xls"
onChange={handleFileUpload}
className="hidden"
/>

</label>

</div>

)

}