import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import PageMetadata from "./components/PageMetadata.jsx";
import About from "./pages/About.jsx";
import Admin from "./pages/Admin.jsx";
import Booking from "./pages/Booking.jsx";
import Home from "./pages/Home.jsx";
import Policies from "./pages/Policies.jsx";
import Services from "./pages/Services.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <PageMetadata />
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
              <Services />
              <About />
              <Booking />
            </Layout>
          }
        />
        <Route
          path="/politicas"
          element={
            <Layout>
              <Policies />
            </Layout>
          }
        />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
