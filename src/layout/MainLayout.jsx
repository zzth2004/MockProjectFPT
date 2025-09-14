import React from 'react';
import Header from '../components/PageComponent/Header';
import Footer from '../components/PageComponent/Footer';
import ScrollToTopButton from "../components/ScrollToTop";

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main>{children}</main>
      <Footer />
      
      <ScrollToTopButton />
    </div>
  );
}
