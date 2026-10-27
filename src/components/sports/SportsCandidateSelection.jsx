export default function SportsCandidateSelection(){

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

Sports Candidate Selection

</h2>

<select className="border rounded-xl px-4 py-3">

<option>100m Race</option>

</select>

</div>

<div className="grid md:grid-cols-2 gap-8 mt-8">

{/* BLUE TEAM */}

<div className="border rounded-2xl p-6 bg-[#f4fbff]">

<h2 className="text-2xl font-bold text-blue-500">

Blue Team

</h2>

<div className="space-y-4 mt-6">

<select className="border rounded-xl px-4 py-3 w-full">

<option>Select Participant</option>

{blueStudents.map((s,i)=>(
<option key={i}>{s}</option>
))}

</select>

<select className="border rounded-xl px-4 py-3 w-full">

<option>Select Participant</option>

{blueStudents.map((s,i)=>(
<option key={i}>{s}</option>
))}

</select>

</div>

</div>

{/* GREEN TEAM */}

<div className="border rounded-2xl p-6 bg-[#f6fff6]">

<h2 className="text-2xl font-bold text-green-500">

Green Team

</h2>

<div className="space-y-4 mt-6">

<select className="border rounded-xl px-4 py-3 w-full">

<option>Select Participant</option>

{greenStudents.map((s,i)=>(
<option key={i}>{s}</option>
))}

</select>

<select className="border rounded-xl px-4 py-3 w-full">

<option>Select Participant</option>

{greenStudents.map((s,i)=>(
<option key={i}>{s}</option>
))}

</select>

</div>

</div>

</div>

<button className="bg-[#a0d2eb] text-black px-6 py-3 rounded-xl mt-8">

Save Sports Participants

</button>

</div>

)

}