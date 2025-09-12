import React from 'react';
import Header from '../components/PageComponent/Header';
import Footer from '../components/PageComponent/Footer';

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main>{children}</main>
      <Footer />
      
    </div>
  );
}
