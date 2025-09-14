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
    onSuccess: () => {
      alert("Đăng nhập thành công ✅");
      navigate("/dashboard"); // tuỳ route bạn muốn
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
