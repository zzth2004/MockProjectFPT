import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function InputComponent({
  labelText,
  hintText,
  value,
  onChange,
  prefixIcon,
  errorText,
  onEditingComplete,
  type = "text", // mặc định là text
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="mb-4">
      {labelText && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {labelText}
        </label>
      )}

      <div
        className={`flex items-center border rounded-md px-3 py-2 transition duration-150 ${
          errorText
            ? "border-red-500 focus-within:border-red-500"
            : "border-gray-300 focus-within:border-blue-500"
        }`}
      >
        {prefixIcon && <span className="mr-2 text-gray-500">{prefixIcon}</span>}

        <input
          type={isPassword ? (showPassword ? "text" : "password") : type}
          placeholder={hintText}
          value={value}
          onChange={onChange}
          onBlur={onEditingComplete}
          className="flex-1 outline-none bg-transparent text-sm text-gray-800 placeholder-gray-400"
        />

        {isPassword && (
          <button
            type="button"
            onClick={toggleShowPassword}
            className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {errorText && (
        <p className="text-red-500 text-sm mt-1">{errorText}</p>
      )}
    </div>
  );
}

export default InputComponent;
