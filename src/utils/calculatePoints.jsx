export default function calculatePoints(

type,
position,
grade,
participants = []

){

/* POSITION POINTS */

const positionPoints = {

first:5,
second:3,
third:1

};

/* GRADE POINTS */

const gradePoints = {

A:5,
B:3,
C:1

};

/* TOTAL */

const totalPoints =

(positionPoints[position] || 0)

+

(gradePoints[grade] || 0);

/* INDIVIDUAL */

if(type === "Individual"){

return {

teamPoints:totalPoints,

personalPoints:

participants.map((p)=>({

name:p,
points:totalPoints

}))

};

}

/* PERSONAL GROUP */

if(type === "Personal Group"){

const splitPoints =

participants.length > 0

? totalPoints / participants.length

: 0;

return {

teamPoints:totalPoints,

personalPoints:

participants.map((p)=>({

name:p,
points:splitPoints

}))

};

}

/* GROUP */

if(type === "Group"){

return {

teamPoints:totalPoints,

personalPoints:[]

};

}

/* GENERAL */

if(type === "General"){

return {

teamPoints:totalPoints,

personalPoints:[]

};

}

/* DEFAULT */

return {

teamPoints:0,

personalPoints:[]

};

}