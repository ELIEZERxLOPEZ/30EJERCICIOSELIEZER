
import { Search, Bell, UserCircle } from "lucide-react";

function Header({ search, setSearch }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    setSearch(search.trim());
  };

  return (
    <header className="header">
      <div className="header-title">
        <h1>Panel de ejercicios</h1>
        <p>Aprende programación paso a paso</p>
      </div>

      <div className="header-actions">
        <form className="search-box" onSubmit={handleSubmit}>
          <button
            type="submit"
            className="search-submit"
            aria-label="Buscar ejercicios"
          >
            <Search size={21} />
          </button>

          <input
            type="search"
            placeholder="Ej. 1 o Ejercicio 1..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <button className="icon-button" aria-label="Notificaciones">
          <Bell size={20} />
        </button>

        <div className="user-profile">
          <UserCircle size={28} />
          <span>Estudiante</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
