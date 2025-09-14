import { useNavigate } from "react-router-dom";
import useCallApiHandler  from "./HookHander/useCallApiHandler";
import useFormHandler  from "./HookHander/useFormHandler";
import { registerApi } from "../services/authService";
import {Validator} from "../utils/Validator";


export function useRegisterForm() {
  const navigate = useNavigate();
  const { data, loading, error, call } = useCallApiHandler(registerApi);

  const form = useFormHandler({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      address: "",
    },
    validators: {
      name: (val) => Validator.validateFullname(val),
      email: (val) => Validator.validateEmail(val),
      password: (val) => Validator.validatePassword(val),
      confirmPassword: (val, values) =>
        val !== values.password ? "Mật khẩu không khớp" : null,
      phone: (val) => Validator.validatePhone(val),
      address: (val) => Validator.validateUsername(val),
    },
    apiFn: call,
    onSuccess: () => {
      alert("Đăng ký thành công ✅");
      navigate("/verify", { state: { email: form.values.email } });
    },
    onError: (err) => {
      console.error("Register error:", err);
    },
  });

  return {
    ...form,
    apiState: { data, loading, error },
  };
}