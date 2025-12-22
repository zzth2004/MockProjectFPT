// src/hooks/useLoginForm.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCallApiHandler from "./HookHander/useCallApiHandler";
import useFormHandler from "./HookHander/useFormHandler";
import { loginApi } from "../services/authService";
import { Validator } from "../utils/Validator";
import { useAuth } from "../context/authContext";

export function useLoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();


  // Gọi API login
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
      console.log("Login Success Data:", res);

      if (!res || !res.user || !res.jwt) {
        console.error("Dữ liệu trả về thiếu user hoặc jwt:", res);
        alert("Lỗi hệ thống: Không nhận được thông tin người dùng.");
        return;
      }

      const { user, jwt } = res;
      login(user, jwt);
       navigate("/user/dashboard", { replace: true });
    },
    onError: (err) => {
      console.error("Login failed:", err);
      // Hiển thị thông báo lỗi cụ thể từ Backend gửi về (đã được service xử lý)
      alert(err.message || "Email hoặc mật khẩu không đúng ❌");
    },
  });

  return {
    ...form,
    apiState: { data, loading, error },
  };
}