
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

function ExerciseCard({
  number,
  title,
  description,
  category,
  emoji,
}) {
  const navigate = useNavigate();

  const openExercise = () => {
    navigate(`/ejercicio/${number}`);
  };

  return (
    <article className="exercise-card">
      <div className="exercise-card-top">
        <div className="exercise-icon">
          <span>{emoji}</span>
        </div>

        <span className="exercise-category">
          {category}
        </span>
      </div>

      <div className="exercise-card-content">
        <span className="exercise-number">
          RETO Nº {String(number).padStart(2, "0")}
        </span>

        <h3>{title}</h3>

        <p>{description}</p>
      </div>

      <button
        className="exercise-button"
        onClick={openExercise}
      >
        Ver ejercicio
        <ArrowUpRight size={18} />
      </button>
    </article>
  );
}

export default ExerciseCard;
