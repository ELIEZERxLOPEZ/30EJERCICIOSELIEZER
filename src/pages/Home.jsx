
import { useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import ExerciseCard from "../components/ExerciseCard";
import exercises from "../Data-temp/exercises";

function Home({ search = "" }) {
  const [selectedExercise, setSelectedExercise] = useState(null);

  const searchText = search.trim().toLowerCase();

  const filteredExercises = exercises.filter((exercise) => {
    if (!searchText) return true;

    // Reconocer "1", "ejercicio 1" o "Ejercicio Nº 1"
    const numberText = searchText
      .replace(/^ejercicio\s*(n[.º°]?\s*)?/i, "")
      .trim();

    if (/^\d+$/.test(numberText)) {
      return exercise.number === Number(numberText);
    }

    // Buscar por nombre, descripción y categoría
    return (
      exercise.title.toLowerCase().includes(searchText) ||
      exercise.description.toLowerCase().includes(searchText) ||
      exercise.category.toLowerCase().includes(searchText)
    );
  });

  // En Inicio mostramos como máximo 10 ejercicios
  const visibleExercises = filteredExercises.slice(0, 10);

  return (
    <main className="home">

      {/* PORTADA */}
      <section className="welcome-section">
        <span className="welcome-label">
          ✦ LEARN. BUILD. CREATE.
        </span>

        <h2>
          El código cobra vida
          <br />
          cuando lo creas.
        </h2>

        <p>
          30 retos. Infinitas posibilidades. Explora,
          experimenta y demuestra lo que puedes crear.
        </p>
      </section>

      {/* LISTA DE EJERCICIOS */}
      <section className="exercises-section">

        <div className="section-heading">
          <div>
            <h2>
              Explora los retos <span>✳</span>
            </h2>

            <p>
              Tu próximo desafío comienza aquí.
            </p>
          </div>

          <span className="exercise-count">
            {filteredExercises.length} resultados
          </span>
        </div>

        {visibleExercises.length > 0 ? (
          <div className="exercise-grid">
            {visibleExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.number}
                number={exercise.number}
                title={exercise.title}
                description={exercise.description}
                category={exercise.category}
                emoji={exercise.emoji}
                onClick={() => setSelectedExercise(exercise)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span>🔎</span>

            <h3>No encontramos ese ejercicio</h3>

            <p>
              Prueba con su número o con el nombre del ejercicio.
            </p>
          </div>
        )}

        {/* BOTÓN MOSTRAR MÁS */}
        {!searchText && filteredExercises.length > 10 && (
          <div className="show-more-container">
            <Link
              to="/ejercicios"
              className="show-more-button"
            >
              Mostrar más ejercicios
              <ArrowRight size={19} />
            </Link>
          </div>
        )}

        {searchText && filteredExercises.length > 10 && (
          <div className="show-more-container">
            <Link
              to="/ejercicios"
              className="show-more-button"
            >
              Ver todos los resultados
              <ArrowRight size={19} />
            </Link>
          </div>
        )}

      </section>

      {/* SELECCIÓN DEL EJERCICIO */}
      {selectedExercise && (
        <section className="exercise-message">
          <span>{selectedExercise.emoji}</span>

          <h3>
            Ejercicio {selectedExercise.number}
          </h3>

          <p>{selectedExercise.title}</p>

          <p>{selectedExercise.description}</p>

          <button
            onClick={() => setSelectedExercise(null)}
          >
            Cerrar
            <ArrowUpRight size={17} />
          </button>
        </section>
      )}

    </main>
  );
}

export default Home;
