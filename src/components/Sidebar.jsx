
import { NavLink } from "react-router-dom";
import { Home, BookOpen, Code2 } from "lucide-react";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Code2 size={28} />
        <h2>CodeLab</h2>
      </div>

      <nav className="sidebar-menu">
        <NavLink to="/" end className="menu-item">
          <Home size={20} />
          <span>Inicio</span>
        </NavLink>

        <NavLink to="/ejercicios" className="menu-item">
          <BookOpen size={20} />
          <span>Ejercicios</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <p>30 ejercicios de C#</p>
        <small>Proyecto desarrollado con React</small>
      </div>
    </aside>
  );
}

export default Sidebar;
