import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

export default function generateCandidatesPDF(

candidates,
title="Candidates List"

){

const doc = new jsPDF();

const pageWidth = doc.internal.pageSize.width;

/* WATERMARK */

doc.setGState(
new doc.GState({ opacity: 0.05 })
);

doc.addImage(

"/logo/fanmeni.png",

"PNG",

40,
60,
130,
130

);

doc.setGState(
new doc.GState({ opacity: 1 })
);

/* HEADER */

doc.setFillColor(132,88,179);

doc.rect(0,0,pageWidth,35,"F");

doc.setFont("helvetica","bold");

doc.setTextColor(255,255,255);

doc.setFontSize(26);

doc.text(

"FANMENI 26",

pageWidth / 2,
18,
{ align:"center" }

);

doc.setFontSize(13);

doc.text(

"Siddeeq Moula Arabic College",

pageWidth / 2,
27,
{ align:"center" }

);

/* TITLE */

doc.setTextColor(40);

doc.setFontSize(22);

doc.text(

title,

pageWidth / 2,
50,
{ align:"center" }

);

/* TABLE */

autoTable(doc,{

startY:65,

head:[[
"Program",
"Category",
"Type",
"Blue Team",
"Green Team"
]],

body:candidates.map((c)=>[

c.program || "-",

c.category || "-",

c.type || "-",

Array.isArray(c.teamA)
? c.teamA.join(", ")
: "-",

Array.isArray(c.teamB)
? c.teamB.join(", ")
: "-"

]),

theme:"grid",

headStyles:{

fillColor:[132,88,179],

halign:"center",

fontSize:12

},

bodyStyles:{

fontSize:10,

cellPadding:4

},

alternateRowStyles:{

fillColor:[248,248,255]

},

styles:{

lineColor:[220,220,220],

lineWidth:0.2

}

});

doc.save(`${title}.pdf`);

}