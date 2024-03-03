import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Template from "./components/Template";

import "./App.css";
import "antd/dist/reset.css";

function App() {
  return (
    <Router>
      <header className="bg-blue-500 text-white p-4 w-full">
        <h1 className="text-4xl font-bold font-mono">Aim Monkey</h1>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/template/:templateName" element={<Template />} />
      </Routes>
    </Router>
  );
}

export default App;
