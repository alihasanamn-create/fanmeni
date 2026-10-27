import * as XLSX from "xlsx";

import { saveAs } from "file-saver";

export default function DownloadTemplateButton({

title,
fileName,
sampleData

}){

function downloadTemplate(){

const worksheet = XLSX.utils.json_to_sheet(sampleData);

const workbook = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(

workbook,
worksheet,
"Template"

);

const excelBuffer = XLSX.write(workbook,{

bookType:"xlsx",
type:"array"

});

const blob = new Blob(

[excelBuffer],

{
type:
"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
}

);

saveAs(blob,fileName);

}

return(

<button
onClick={downloadTemplate}
className="bg-green-500 text-white px-6 py-4 rounded-xl"
>

{title}

</button>

)

}