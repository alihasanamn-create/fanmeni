export default function TeamCard({ name, points }) {

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 text-center">

      <h3 className="text-xl font-bold">
        {name}
      </h3>

      <p className="mt-2 text-green-700 font-semibold">
        {points} Points
      </p>

    </div>
  );
}