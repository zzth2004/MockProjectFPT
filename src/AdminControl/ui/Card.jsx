export default function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-shadow duration-200 ${className}`}
    >
      {children}
    </div>
  );
}
