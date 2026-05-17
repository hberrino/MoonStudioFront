import Footer from "./Footer.jsx";
import Header from "./Header.jsx";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <div className="grain-overlay" />
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
