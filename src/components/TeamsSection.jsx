import TeamCard from "./TeamCard";

const teams = [
  { name: "Team A", points: 75 },
  { name: "Team B", points: 65 },
  { name: "Team C", points: 55 },
  { name: "Team D", points: 40 },
];

export default function TeamsSection() {

  return (
    <div>

      <h2 className="text-3xl font-bold mb-6 text-center">
        Teams
      </h2>

      <div className="grid md:grid-cols-4 gap-6">

        {teams.map((team, i) => (
          <TeamCard key={i} {...team} />
        ))}

      </div>

    </div>
  );
}