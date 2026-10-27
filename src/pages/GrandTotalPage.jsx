import {useEffect,useState} from "react";

import {
collection,
onSnapshot,
query,
orderBy
} from "firebase/firestore";

import {db} from "../firebase";


// Declared at module scope: defining it inside the render body would recreate the
// component (and reset its subtree state) on every render.
function TopperCard({title,data}){


return(


<div className="
bg-white
rounded-3xl
shadow-xl
p-5
text-center
h-72
">


<h2 className="font-black text-[#8458B3]">


{title}


</h2>



{data && (


<>


<img

src={data.photo}

className="
w-20
h-20
rounded-full
mx-auto
mt-3
object-cover
"

/>




<h1 className="
text-5xl
font-black
text-[#8458B3]
mt-3
">


{data.points}


</h1>



<p className="font-bold text-sm">

POINTS

</p>




<h3 className="font-bold mt-2">


{data.name}


</h3>



<p>

{data.code}

</p>



<div className="
bg-[#8458B3]
text-white
rounded-xl
mt-2
py-1
">


{data.team}


</div>


</>


)}



</div>


)


}

export default function GrandTotalPage(){


const [results,setResults]=useState([]);
const [students,setStudents]=useState([]);



useEffect(()=>{


const a=onSnapshot(

query(
collection(db,"results"),
orderBy("createdAt","desc")
),

(s)=>{

setResults(

s.docs.map(d=>({

id:d.id,
...d.data()

}))

);

}

);



const b=onSnapshot(

collection(db,"students"),

(s)=>{

setStudents(

s.docs.map(d=>({

id:d.id,
...d.data()

}))

);

}

);



return()=>{

a();
b();

};


},[]);





function point(position,grade){


let p=0;


if(position==="first") p+=5;

if(position==="second") p+=3;

if(position==="third") p+=1;



if(grade==="A") p+=5;

if(grade==="B") p+=3;

if(grade==="C") p+=1;



return p;


}







let personal={};

let teams={};



results.forEach(r=>{


[
["first",r.positions?.first,r.firstGrade],
["second",r.positions?.second,r.secondGrade],
["third",r.positions?.third,r.thirdGrade]

].forEach(x=>{


let pts=point(x[0],x[2]);


let stu=students.find(

s=>s.name===x[1]

);



if(stu){


personal[stu.id]={

...stu,

points:

(personal[stu.id]?.points||0)

+

pts

};



teams[stu.team]=

(teams[stu.team]||0)

+

pts;


}



});




r.additionalGrades?.forEach(g=>{


let stu=students.find(

s=>s.name===g.name

);



if(stu){


let pts=point("",g.grade);


personal[stu.id]={

...stu,

points:

(personal[stu.id]?.points||0)

+

pts

};



teams[stu.team]=

(teams[stu.team]||0)

+

pts;


}


});



});







const toppers=

Object.values(personal)

.sort(

(a,b)=>b.points-a.points

);



const fanmeni=toppers[0];


const bidaya=

toppers.find(

s=>s.category==="Bidaya"

);



const thaniya=

toppers.find(

s=>s.category==="Thaniya"

);

















return(


<div className="
min-h-screen
bg-[#faf8ff]
p-6
overflow-auto
">





<h1 className="
text-5xl
font-black
text-[#8458B3]
">


FANMENI TOTAL


</h1>






{/* TEAM TOTAL */}


<div className="
grid
grid-cols-3
gap-5
mt-6
">


{Object.entries(teams)

.sort((a,b)=>b[1]-a[1])

.map(([team,pts])=>(


<div key={team}

className="
bg-[#8458B3]
text-white
rounded-3xl
p-6
shadow-xl
text-center
"


>


<h2 className="text-3xl font-black">

{team}

</h2>



<h1 className="text-6xl font-black mt-3">


{pts}


</h1>



<p>

POINTS

</p>


</div>


))}


</div>









{/* TOPPERS */}


<div className="
grid
grid-cols-3
gap-5
mt-6
">


<TopperCard

title="Fanmeni Topper"

data={fanmeni}

/>



<TopperCard

title="Bidaya Topper"

data={bidaya}

/>



<TopperCard

title="Thaniya Topper"

data={thaniya}

/>



</div>









{/* LATEST */}



<div className="
grid
grid-cols-3
gap-5
mt-6
pb-10
">


{results.slice(0,6).map(r=>(



<div key={r.id || r.program} className="
bg-white
rounded-3xl
shadow-xl
p-5
">


<h2 className="
font-black
text-[#8458B3]
text-xl
">


{r.program}


</h2>



{[

["1st",r.positions?.first,r.firstGrade],

["2nd",r.positions?.second,r.secondGrade],

["3rd",r.positions?.third,r.thirdGrade]


].map(x=>{


let s=students.find(

a=>a.name===x[1]

);



return(


<div key={x[0]} className="mt-3">


<b>

{x[0]} {x[2]}

</b>



<p>{s?.name}</p>


<p>{s?.code}</p>


<p>{s?.team}</p>



</div>


)


})}



</div>


))}



</div>





</div>


)


}