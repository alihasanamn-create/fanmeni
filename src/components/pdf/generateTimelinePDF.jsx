import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

export default function generateTimelinePDF(

timeline = []

){

const doc = new jsPDF();

const pageWidth = doc.internal.pageSize.width;

const pageHeight = doc.internal.pageSize.height;

const safeTimeline = Array.isArray(timeline)
? timeline
: [];

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

doc.rect(
0,
0,
pageWidth,
35,
"F"
);

doc.setFont("helvetica","bold");

doc.setTextColor(255,255,255);

doc.setFontSize(26);

doc.text(

"FANMENI 26",

pageWidth / 2,
18,
{
align:"center"
}

);

doc.setFontSize(13);

doc.text(

"Siddeeq Moula Arabic College",

pageWidth / 2,
27,
{
align:"center"
}

);

/* TITLE */

doc.setTextColor(40);

doc.setFontSize(22);

doc.text(

"Program Timeline",

pageWidth / 2,
50,
{
align:"center"
}

);

/* EMPTY */

if(safeTimeline.length === 0){

doc.setFontSize(16);

doc.setTextColor(120);

doc.text(

"No Timeline Available",

pageWidth / 2,
80,
{
align:"center"
}

);

doc.save("PROGRAM_TIMELINE.pdf");

return;

}

/* SORT */

safeTimeline.sort((a,b)=>{

const first = `${a.date} ${a.time}`;

const second = `${b.date} ${b.time}`;

return new Date(first) - new Date(second);

});

/* TABLE */

autoTable(doc,{

startY:65,

head:[[
"Date",
"Time",
"Program",
"Venue"
]],

body:safeTimeline.map((t)=>[

t.date || "-",

t.time || "-",

t.program || "-",

t.venue || "-"

]),

theme:"grid",

headStyles:{

fillColor:[132,88,179],

textColor:[255,255,255],

fontSize:12,

halign:"center"

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

/* FOOTER */

doc.setFontSize(10);

doc.setTextColor(120);

doc.text(

"Generated from FANMENI 26 Management System",

pageWidth / 2,
pageHeight - 10,
{
align:"center"
}

);

/* SAVE */

doc.save("PROGRAM_TIMELINE.pdf");

}