
import ExerciseCard from "../components/ExerciseCard";
import exercises from "../Data-temp/exercises";

function Exercises({ search = "" }) {
  const filteredExercises = exercises.filter((exercise) => {
    const text = search.trim().toLowerCase();

    return (
      exercise.title.toLowerCase().includes(text) ||
      exercise.description.toLowerCase().includes(text) ||
      exercise.category.toLowerCase().includes(text) ||
      String(exercise.number).includes(text)
    );
  });

  return (
    <main className="home">
      <section className="welcome-section">
        <span className="welcome-label">
          ✦ YOUR CODING JOURNEY
        </span>

        <h2>
          Todos los retos.
          <br />
          Un solo lugar.
        </h2>

        <p>
          Explora los ejercicios y demuestra todo lo que
          puedes hacer con C#.
        </p>
      </section>

      <section className="exercises-section">
        <div className="section-heading">
          <div>
            <h2>Biblioteca de ejercicios ✳</h2>
            <p>Selecciona un reto para comenzar.</p>
          </div>

          <span className="exercise-count">
            {filteredExercises.length} ejercicios
          </span>
        </div>

        <div className="exercise-grid">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.number}
              {...exercise}
              onClick={() =>
                alert(`Ejercicio ${exercise.number}: ${exercise.title}`)
              }
            />
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="empty-state">
            <span>🔎</span>
            <h3>No encontramos ese ejercicio</h3>
            <p>Intenta buscar con otra palabra.</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default Exercises;
