// src/page/error/PageNotFound.jsx
import React from "react";
import { Link } from "react-router-dom";
import LayoutNoSideBar from "../../layout/LayoutNoSideBar";

export default function PageNotFound2() {
  return (
    <LayoutNoSideBar>
      <section className="page_404 min-h-screen flex items-center justify-center bg-white font-serif">
        <div className="container mx-auto px-4">
          <div className="text-center">
            {/* Background 404 GIF */}
            <div
              className="four_zero_four_bg h-[400px] bg-center bg-no-repeat flex items-center justify-center"
              style={{
                backgroundImage:
                  "url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif)",
              }}
            >
              <h1 className="text-[80px] font-bold text-gray-800">404</h1>
            </div>

            {/* Nội dung */}
            <div className="contant_box_404 -mt-12">
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                Look like you&apos;re lost
              </h3>
              <p className="text-gray-500 mb-6">
                The page you are looking for is not available!
              </p>

              <Link
                to="/"
                className="link_404 inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </LayoutNoSideBar>
  );
}
