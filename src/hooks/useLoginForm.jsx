// src/hooks/useLoginForm.js
import { useNavigate } from "react-router-dom";
import useCallApiHandler from "./HookHander/useCallApiHandler";
import useFormHandler from "./HookHander/useFormHandler";
import { loginApi } from "../services/authService";
import { Validator } from "../utils/Validator";

export function useLoginForm() {
  const navigate = useNavigate();
  const { data, loading, error, call } = useCallApiHandler(loginApi);

  const form = useFormHandler({
    initialValues: {
      email: "",
      password: "",
    },
    validators: {
      email: (val) => Validator.validateEmail(val),
      password: (val) => Validator.validatePassword(val),
    },
    apiFn: call,
    onSuccess: (res) => {
      alert("Đăng nhập thành công ✅");
      console.log("Login successful:", res);
      if (res?.user?.role === "admin") {
        navigate("/admin/dashboard"); // Admin sẽ vào trang admin
        console.log(`🚀 Admin logged in:`, res?.user?.role);
      } else {
        navigate("/user/dashboard"); // User thường vào dashboard
      }
    },
    onError: (err) => {
      console.error("Login error:", err);
    },
  });

  return {
    ...form,
    apiState: { data, loading, error },
  };
}
