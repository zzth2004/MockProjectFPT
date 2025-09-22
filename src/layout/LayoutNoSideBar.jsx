import React, { useState, useEffect } from 'react';
import Header from '../components/PageComponent/MainHeader';
import Footer from '../components/PageComponent/Footer';
import ScrollToTopButton from "../components/ScrollToTop";
import { LoadingComponent } from '../components/LoadingComponent'; // import component loading

export default function MainLayout({ children }) {
  const [loading, setLoading] = useState(true);

  // Giả lập loading khi mount (bạn có thể thay bằng fetch API)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500); // 1.5s loading
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Loading overlay */}
      <LoadingComponent
        isVisible={loading}
        onComplete={() => console.log("Loading complete")}
      />

      {/* Nội dung chính */}
      <Header />
      <main className={`${loading ? "pointer-events-none opacity-50" : ""}`}>
        {children}
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}
