// src/components/Button.jsx
import React from "react";
import { Link } from "react-router-dom";

const PRIMARY = "#008236";

export default function Button({ to, onClick, children, variant = "primary", className = "" }) {
  const base =
    "inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2";

  if (variant === "primary") {
    return (
      <Link
        to={to || "#"}
        onClick={onClick}
        className={`${base} text-white ${className}`}
        style={{ backgroundColor: PRIMARY, boxShadow: "0 6px 18px rgba(0,130,54,0.25)" }}
      >
        {children}
      </Link>
    );
  }

  if (variant === "ghost") {
    return (
      <Link
        to={to || "#"}
        onClick={onClick}
        className={`${base} border text-gray-800 hover:bg-gray-50 ${className}`}
        style={{ borderColor: PRIMARY }}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      to={to || "#"}
      onClick={onClick}
      className={`${base} bg-gray-200 text-gray-800 hover:bg-gray-300 ${className}`}
    >
      {children}
    </Link>
  );
}
