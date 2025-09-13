export default function Badge({ children, color = "gray" }) {
  const colors = {
    gray: "bg-gray-200 text-gray-700",
    red: "bg-red-100 text-red-600",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-sm font-medium ${colors[color]}`}
    >
      {children}
    </span>
  );
}
