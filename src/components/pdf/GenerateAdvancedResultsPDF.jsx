import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

import pdfDesign from "../../utils/pdfDesign";

export default function GenerateAdvancedResultsPDF(){

function generatePDF(){

const doc = new jsPDF();

pdfDesign(doc,"Detailed Results Report");

autoTable(doc,{

startY:90,

head:[[
"Program",
"1st",
"2nd",
"3rd",
"Grades",
"Points"
]],

body:[

[
"Arabic Speech",
"Ahmed",
"Ali",
"Rahman",
"A / B / C",
"8 / 5 / 2"
],

[
"Essay Writing",
"Hassan",
"Rashid",
"Shamil",
"A / A / B",
"8 / 6 / 3"
]

],

styles:{

font:"times",
fontSize:11,
cellPadding:4

},

headStyles:{

fillColor:[132,88,179]

},

alternateRowStyles:{

fillColor:[245,245,255]

}

});

doc.save("detailed-results.pdf");

}

return(

<div>

<h2 className="text-3xl font-bold text-[#8458B3] heading-font">

Advanced Results PDF

</h2>

<p className="text-gray-500 mt-3">

Generate detailed official results report

</p>

<button
onClick={generatePDF}
className="bg-[#8458B3] text-white px-6 py-3 rounded-xl mt-8"
>

Download PDF

</button>

</div>

)

}