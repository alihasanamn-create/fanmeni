import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";


export default function generateSportsCandidatesPDF(candidates=[]){


const doc = new jsPDF("landscape");


const pageWidth = doc.internal.pageSize.width;





/* HEADER */


doc.setFillColor(75,131,255);


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



doc.setFontSize(18);




doc.text(

"FANMENI 26 - RIYADHA CANDIDATES",

pageWidth/2,

14,

{

align:"center"

}

);








let rows=[];





candidates.forEach((item,index)=>{



let firstRow=true;





Object.entries(

item.teams || {}

).forEach(([team,groups])=>{






Object.entries(groups)

.forEach(([group,players])=>{






players.forEach(player=>{





rows.push([



firstRow ? index+1 : "",



firstRow ? item.program : "",



firstRow ? item.category : "",



firstRow ? item.type : "",



team,



group,



player.code || "",



player.name || player



]);






firstRow=false;





});





});






});






});









autoTable(doc,{



startY:30,



head:[[

"SL",

"PROGRAM",

"CAT",

"TYPE",

"TEAM",

"GROUP",

"CODE",

"NAME"

]],






body:rows,






theme:"grid",






styles:{



fontSize:8,



cellPadding:2,



overflow:"linebreak",



valign:"middle"



},







headStyles:{



fillColor:[75,131,255],



textColor:255,



halign:"center"



},







columnStyles:{



0:{cellWidth:10},



1:{cellWidth:45},



2:{cellWidth:25},



3:{cellWidth:35},



4:{cellWidth:35},



5:{cellWidth:20},



6:{cellWidth:25},



7:{cellWidth:55}



},






margin:{


left:8,


right:8


}




});









doc.save(

"RIYADHA_CANDIDATES_COMPACT.pdf"

);



}