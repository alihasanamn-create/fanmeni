import { useEffect,useState } from "react";

import {
PieChart,
Pie,
Cell,
ResponsiveContainer,
Tooltip
} from "recharts";

import {
collection,
onSnapshot
} from "firebase/firestore";

import { db } from "../../firebase";

export default function ProgramsPieChart(){

const [data,setData] = useState([]);

useEffect(()=>{

const unsubPrograms = onSnapshot(

collection(db,"arts_programs"),

(programSnapshot)=>{

const totalPrograms = programSnapshot.docs.length;

const unsubResults = onSnapshot(

collection(db,"arts_results"),

(resultSnapshot)=>{

const announced = resultSnapshot.docs.length;

const pending = totalPrograms - announced;

setData([

{
name:"Announced",
value:announced
},

{
name:"Pending",
value:pending > 0 ? pending : 0
}

]);

}

);

return ()=>unsubResults();

}

);

return ()=>unsubPrograms();

},[]);

const COLORS = [

"#8458B3",
"#d0bdf4"

];

return(

<div className="bg-white rounded-3xl shadow p-4 md:p-8">

<h2 className="text-3xl font-bold text-[#8458B3] heading-font">

Programs Status

</h2>

<div className="h-[300px] mt-8">

<ResponsiveContainer width="100%" height="100%">

<PieChart>

<Pie
data={data}
dataKey="value"
outerRadius={100}
label
>

{data.map((entry,index)=>(

<Cell
key={index}
fill={COLORS[index % COLORS.length]}
/>

))}

</Pie>

<Tooltip/>

</PieChart>

</ResponsiveContainer>

</div>

</div>

)

}