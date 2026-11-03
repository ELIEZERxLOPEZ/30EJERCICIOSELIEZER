
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Home from "./pages/Home";
import Exercises from "./pages/Exercises";
import ExerciseDetail from "./pages/ExerciseDetail";

import "./App.css";

function App() {
  const [search, setSearch] = useState("");

  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />

        <div className="main-container">
          <Header
            search={search}
            setSearch={setSearch}
          />

          <Routes>
            <Route
              path="/"
              element={<Home search={search} />}
            />

            <Route
              path="/ejercicios"
              element={<Exercises search={search} />}
            />

            <Route
              path="/ejercicio/:id"
              element={<ExerciseDetail />}
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
