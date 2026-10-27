export default function ResultCard({
program,
student,
team,
position,
grade,
photo
}){

return(

<div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">

<img
src={photo}
alt={student}
className="w-full h-52 object-cover"
/>

<div className="p-4">

<h2 className="text-xl font-bold text-[#8458B3]">

{program}

</h2>

<p className="mt-2 font-semibold">

{student}

</p>

<p className="text-gray-500">

{team}

</p>

<div className="flex gap-3 mt-3">

{position && (

<span className="bg-[#d0bdf4] px-3 py-1 rounded-full">

{position}

</span>

)}

{grade && (

<span className="bg-[#a0d2eb] px-3 py-1 rounded-full">

Grade {grade}

</span>

)}

</div>

</div>

</div>

)

}