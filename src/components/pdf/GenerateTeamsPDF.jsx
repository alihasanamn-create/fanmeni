import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

export default function generateTeamsPDF(

teams = [],
students = []

){

const doc = new jsPDF();

const safeTeams = Array.isArray(teams)
? teams
: [];

const safeStudents = Array.isArray(students)
? students
: [];

safeTeams.forEach((team,index)=>{

if(index > 0){

doc.addPage();

}

const pageWidth = doc.internal.pageSize.width;

const pageHeight = doc.internal.pageSize.height;

/* TEAM STUDENTS */

const teamStudents = safeStudents

.filter((s)=>

s.team === team.name

)

.sort((a,b)=>{

return (a.code || "").localeCompare(

b.code || ""

);

});

/* WATERMARK */

doc.setGState(
new doc.GState({ opacity: 0.05 })
);

try{

doc.addImage(

"/logo/fanmeni.png",

"PNG",

40,
55,
130,
130

);

}catch(error){

console.log(error);

}

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

doc.setTextColor(255,255,255);

doc.setFont("helvetica","bold");

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

/* TEAM TITLE */

doc.setTextColor(40,40,40);

doc.setFontSize(24);

doc.text(

`${team.name || "TEAM"} TEAM`,

pageWidth / 2,
50,
{
align:"center"
}

);

/* CAPTAIN TABLE */

autoTable(doc,{

startY:60,

head:[[
"Captain",
"Assistant Captain"
]],

body:[[
team.captain || "-",
team.assistantCaptain || "-"
]],

theme:"grid",

headStyles:{

fillColor:[132,88,179],

textColor:[255,255,255],

halign:"center"

},

bodyStyles:{

halign:"center"

}

});

/* MEMBERS TITLE */

doc.setFontSize(18);

doc.setTextColor(132,88,179);

doc.text(

"Team Members",

14,
95

);

/* MEMBERS TABLE */

autoTable(doc,{

startY:102,

head:[[
"Sl No",
"Code No",
"Name",
"Category"
]],

body:teamStudents.map((s,index)=>[

index + 1,

s.code || "-",

s.name || "-",

s.category || "-"

]),

theme:"grid",

headStyles:{

fillColor:[132,88,179],

textColor:[255,255,255],

halign:"center"

},

bodyStyles:{

fontSize:11,

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

/* EMPTY */

if(teamStudents.length === 0){

doc.setFontSize(14);

doc.setTextColor(120);

doc.text(

"No team members uploaded",

pageWidth / 2,
120,
{
align:"center"
}

);

}

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

});

doc.save("FANMENI_TEAMS.pdf");

}