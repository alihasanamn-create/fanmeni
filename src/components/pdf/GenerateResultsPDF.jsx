import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";


export default function generateResultsPDF(

results=[],

title="Result List"

){


const doc = new jsPDF("landscape");


const pageWidth = doc.internal.pageSize.width;


const isSports =
title.toLowerCase().includes("riyadha");




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





doc.setTextColor(

255,

255,

255

);



doc.setFont(

"helvetica",

"bold"

);



doc.setFontSize(17);




doc.text(

`FANMENI '26  ${title.toUpperCase()}`,

pageWidth/2,

14,

{

align:"center"

}

);







let body=[];








results.forEach((r,index)=>{






/* PROGRAM ROW */


body.push([


index+1,


r.program || "-",


r.category || "-",


r.type || "-",


"",

"",

"",

""




]);










function addRows(

position,

items

){





(items || [])

.forEach(w=>{






body.push([



"",


"",


"",


"",



position,



w.grade || "-",



w.code || "-",



`${w.name || "-"} (${w.team || "-"})`




]);





});





}










addRows(

"1",

r.positions?.first

);




addRows(

"2",

r.positions?.second

);





addRows(

"3",

r.positions?.third

);









(r.additionalGrades || [])

.forEach(g=>{






body.push([


"",

"",

"",

"",


"-",


g.grade || "-",


g.code || "-",


`${g.name || "-"} (${g.team || "-"})`



]);





});










body.push([

"",

"",

"",

"",

"",

"",

"",

""

]);







});









autoTable(doc,{



startY:30,



head:[[

"SL",

"PROGRAM",

"CATEGORY",

"TYPE",

"POS",

"GRADE",

"CODE",

"NAME / TEAM"



]],







body,






theme:"grid",






styles:{



fontSize:8,



cellPadding:2,



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



0:{cellWidth:12},



1:{cellWidth:55},



2:{cellWidth:35},



3:{cellWidth:35},



4:{cellWidth:18},



5:{cellWidth:20},



6:{cellWidth:25},



7:{cellWidth:80}



},







margin:{


left:8,


right:8


},







didParseCell:function(data){





if(


data.section==="body"

&&

data.row.raw[0] !== ""


){





data.cell.styles.fillColor =

isSports

?

[235,242,255]

:

[245,240,250];





data.cell.styles.fontStyle="bold";





}




}





});










doc.save(

`${title}_COMPACT.pdf`

);



}