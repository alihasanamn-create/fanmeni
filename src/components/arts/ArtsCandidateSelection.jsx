export default function ArtsCandidateSelection(){

const blueStudents = [
"Ahmed",
"Ali",
"Rahman"
]

const greenStudents = [
"Hassan",
"Rashid",
"Shamil"
]

return(

<div className="bg-white rounded-2xl shadow p-6 mt-10">

<div className="flex justify-between items-center">

<h2 className="text-3xl font-bold text-[#8458B3] heading-font">

Program Candidate Selection

</h2>

<select className="border rounded-xl px-4 py-3">

<option>Arabic Speech</option>

</select>

</div>

<div className="grid md:grid-cols-2 gap-8 mt-8">

{/* TEAM A */}

<div className="border rounded-2xl p-6">

<h2 className="text-2xl font-bold text-blue-500">

Blue Team

</h2>

<div className="space-y-4 mt-6">

<select className="border rounded-xl px-4 py-3 w-full">

<option>Select Candidate</option>

{blueStudents.map((s,i)=>(
<option key={i}>{s}</option>
))}

</select>

<select className="border rounded-xl px-4 py-3 w-full">

<option>Select Candidate</option>

{blueStudents.map((s,i)=>(
<option key={i}>{s}</option>
))}

</select>

</div>

</div>

{/* TEAM B */}

<div className="border rounded-2xl p-6">

<h2 className="text-2xl font-bold text-green-500">

Green Team

</h2>

<div className="space-y-4 mt-6">

<select className="border rounded-xl px-4 py-3 w-full">

<option>Select Candidate</option>

{greenStudents.map((s,i)=>(
<option key={i}>{s}</option>
))}

</select>

<select className="border rounded-xl px-4 py-3 w-full">

<option>Select Candidate</option>

{greenStudents.map((s,i)=>(
<option key={i}>{s}</option>
))}

</select>

</div>

</div>

</div>

<button className="bg-[#8458B3] text-white px-6 py-3 rounded-xl mt-8">

Save Candidates

</button>

</div>

)

}