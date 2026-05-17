import Layout from "./components/Layout.jsx";
import About from "./pages/About.jsx";
import Booking from "./pages/Booking.jsx";
import Home from "./pages/Home.jsx";
import Services from "./pages/Services.jsx";

export default function App() {
  return (
    <Layout>
      <Home />
      <Services />
      <About />
      <Booking />
    </Layout>
  );
}
