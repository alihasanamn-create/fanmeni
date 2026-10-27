const teams = [
{ name: "Blue", arts: 45, sports: 30 },
{ name: "Red", arts: 40, sports: 28 },
{ name: "Green", arts: 35, sports: 25 },
];

export default function Leaderboard() {

const sorted = teams
.map(t => ({
...t,
total: t.arts + t.sports
}))
.sort((a,b)=>b.total-a.total);

return (

<div className="bg-white shadow-lg rounded p-6">

<h2 className="text-2xl font-bold mb-4">
Team Leaderboard
</h2>

<table className="w-full">

<thead className="bg-green-700 text-white">

<tr>
<th>Rank</th>
<th>Team</th>
<th>Total</th>
</tr>

</thead>

<tbody>

{sorted.map((t,i)=>(
<tr key={i} className="border-b">

<td>{i+1}</td>
<td>{t.name}</td>
<td>{t.total}</td>

</tr>
))}

</tbody>

</table>

</div>

);
}