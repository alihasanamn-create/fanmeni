export default function ProgramCategories() {

  return (
    <div className="grid md:grid-cols-2 gap-6">

      <div className="bg-white shadow-lg rounded-xl p-8 text-center">

        <h2 className="text-2xl font-bold text-green-700">
          Arts Programs
        </h2>

        <p className="mt-3">
          Speech, Essay Writing, Quiz, Debate
        </p>

      </div>

      <div className="bg-white shadow-lg rounded-xl p-8 text-center">

        <h2 className="text-2xl font-bold text-blue-700">
          Riyadha (Sports)
        </h2>

        <p className="mt-3">
          Running, Football, Volleyball, Tug of War
        </p>

      </div>

    </div>
  );
}