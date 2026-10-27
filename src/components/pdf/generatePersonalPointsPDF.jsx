import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";


export default function generatePersonalPointsPDF(

students=[],

results=[]

){


const doc=new jsPDF();


const pageWidth=doc.internal.pageSize.width;

const pageHeight=doc.internal.pageSize.height;





/* WATERMARK */


doc.setGState(

new doc.GState({opacity:0.05})

);



doc.addImage(

"/logo/fanmeni.png",

"PNG",

40,

70,

130,

130

);



doc.setGState(

new doc.GState({opacity:1})

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


doc.setFont(

"helvetica",

"bold"

);



doc.setFontSize(26);



doc.text(

"FANMENI 26",

pageWidth/2,

17,

{
align:"center"
}

);




doc.setFontSize(12);



doc.text(

"Siddeeq Moula Arabic College",

pageWidth/2,

27,

{
align:"center"
}

);








/* TITLE */


doc.setTextColor(40);


doc.setFontSize(20);



doc.text(

"Personal Points Ranking",

pageWidth/2,

50,

{
align:"center"
}

);










let points={};






function addPoint(name,pt){



const student=

students.find(

s=>s.name===name

);



if(!student)return;





if(!points[student.id]){


points[student.id]={

...student,

points:0

};


}



points[student.id].points += pt;



}









results.forEach(r=>{



if(r.positions?.first)

addPoint(

r.positions.first,

10

);



if(r.positions?.second)

addPoint(

r.positions.second,

7

);




if(r.positions?.third)

addPoint(

r.positions.third,

5

);







if(r.additionalGrades){



r.additionalGrades.forEach(g=>{



let p=0;



if(g.grade==="A")

p=5;



if(g.grade==="B")

p=3;




if(g.grade==="C")

p=1;




addPoint(

g.name,

p

);



});


}



});










const ranking=

Object.values(points)

.sort(

(a,b)=>b.points-a.points

);









autoTable(doc,{


startY:65,


head:[[

"RANK",

"CODE",

"NAME",

"TEAM",

"CATEGORY",

"POINTS"

]],



body:

ranking.map(

(s,i)=>[

i+1,

s.code || "-",

s.name || "-",

s.team || "-",

s.category || "-",

s.points

]

),




theme:"grid",




headStyles:{


fillColor:[132,88,179],


textColor:[255,255,255],


halign:"center"


},




bodyStyles:{


fontSize:10,


cellPadding:4


},




alternateRowStyles:{


fillColor:[248,248,255]


}




});









doc.setFontSize(10);


doc.setTextColor(120);



doc.text(

"Generated from FANMENI 26 Management System",

pageWidth/2,

pageHeight-10,

{
align:"center"
}

);






doc.save(

"FANMENI_PERSONAL_POINTS.pdf"

);



}