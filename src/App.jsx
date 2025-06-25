// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout   from "./Layout";
import Home     from "@/pages/Home";
import Upload   from "@/pages/Upload";     // ← קובצי העמודים קיימים
import Sessions from "@/pages/Sessions";   // ← אם יש לך עמוד כזה

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"         element={<Home />} />
          <Route path="/home"     element={<Home />} />     {/* אופציונלי */}
          <Route path="/upload"   element={<Upload />} />
          <Route path="/sessions" element={<Sessions />} /> {/* אופציונלי */}
          {/* אפשר להוסיף  <Route path="*" element={<NotFound/>} />  לשגיאות 404 */}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
