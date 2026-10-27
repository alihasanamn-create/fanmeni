import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";


export default function generateProgramsPDF(

programs=[],

title="Programs"

){



const doc = new jsPDF("landscape");



const pageWidth = doc.internal.pageSize.width;





const isSports = title.toLowerCase().includes("riyadha");







/* HEADER */


doc.setFillColor(

isSports ? 75 : 132,

isSports ? 131 : 88,

isSports ? 255 : 179

);



doc.rect(

0,

0,

pageWidth,

22,

"F"

);





doc.setFont(

"helvetica",

"bold"

);



doc.setTextColor(

255,

255,

255

);



doc.setFontSize(18);





doc.text(

`FANMENI 26 - ${title.toUpperCase()}`,

pageWidth/2,

14,

{

align:"center"

}

);









const rows = programs.map(

(p,index)=>[


index+1,


p.program || "-",


p.category || "-",


p.type || "-",


p.count || "-"



]

);










autoTable(doc,{



startY:30,



head:[[

"SL",

"PROGRAM",

"CATEGORY",

"TYPE",

"CANDIDATES"

]],






body:rows,






theme:"grid",






styles:{


fontSize:9,


cellPadding:3,


overflow:"linebreak",


valign:"middle"


},







headStyles:{



fillColor:

isSports

?

[75,131,255]

:

[132,88,179],



textColor:255,



halign:"center"



},







columnStyles:{



0:{cellWidth:15},



1:{cellWidth:90},



2:{cellWidth:45},



3:{cellWidth:55},



4:{cellWidth:35}



},






margin:{


left:10,


right:10


}




});









doc.save(

`${title}_COMPACT.pdf`

);



}