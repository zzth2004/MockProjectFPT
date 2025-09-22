// src/hooks/useLoginForm.js
import { useNavigate } from "react-router-dom";
import useCallApiHandler from "./HookHander/useCallApiHandler";
import useFormHandler from "./HookHander/useFormHandler";
import { loginApi } from "../services/authService";
import { Validator } from "../utils/Validator";
import { useAuth } from "../context/authContext";

export function useLoginForm() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
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
      // Kiểm tra res và user
      if (!res || !res.user) {
        console.error("Login API trả về dữ liệu không hợp lệ:", res);
        alert("Đăng nhập thất bại ❌");
        return;
      }

      // Lưu user vào context
      setUser(res.user);

      // Redirect theo role
      if (res.user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
        console.log("🚀 Admin logged in:", res.user);
      } else {
        navigate("/user/dashboard", { replace: true });
        console.log("👤 User logged in:", res.user);
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
