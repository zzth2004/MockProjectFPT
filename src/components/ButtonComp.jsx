import React from "react";
import classNames from "classnames";

function ButtonComponent({
  text,
  onClick,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  type = "button",
  icon = null,
  color = "", // custom class override
}) {
  const baseStyle =
    "rounded-md text-sm font-semibold transition duration-150 flex items-center justify-center gap-2";

  const variants = {
    primary: "text-white hover:bg-blue-700",
    secondary: "text-gray-800 hover:bg-gray-300",
    danger: "text-white hover:bg-red-700",
  };

  const backgroundColors = {
    primary: "bg-blue-600",
    secondary: "bg-gray-200",
    danger: "bg-red-600",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
    xl: "px-6 py-3 text-lg",
  };

  const disabledStyle = "opacity-50 cursor-not-allowed";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classNames(
        baseStyle,
        sizes[size],
        color ? color : `${backgroundColors[variant]} ${variants[variant]}`,
        { "w-full": fullWidth },
        { [disabledStyle]: disabled }
      )}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      <span>{text}</span>
    </button>
  );
}

export default ButtonComponent;
