// src/hooks/useRegisterForm.js
import { useNavigate } from "react-router-dom";
import useCallApiHandler from "./HookHander/useCallApiHandler";
import useFormHandler from "./HookHander/useFormHandler";
import { registerApi } from "../services/authService";
import { Validator } from "../utils/Validator";
import { useAuth } from "../context/authContext"; // 👈 1. Import Auth Context

export function useRegisterForm() {
  const navigate = useNavigate();
  const { login } = useAuth(); // 👈 2. Lấy hàm setUser
  const { data, loading, error, call } = useCallApiHandler(registerApi);

  const form = useFormHandler({
    initialValues: {
      fullName: "", // Lưu ý: Backend dùng 'fullName', form nên map đúng lúc gọi API
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      address: "",
    },
    validators: {
      fullName: (val) => Validator.validateFullname(val),
      email: (val) => Validator.validateEmail(val),
      password: (val) => Validator.validatePassword(val),
      confirmPassword: (val, values) =>
        val !== values.password ? "Mật khẩu không khớp" : null,
      phone: (val) => Validator.validatePhone(val),
      address: (val) => Validator.validateUsername(val),
    },
    apiFn: (values) => {
        // Map data từ form sang đúng tên field backend cần (nếu cần thiết)
        // Backend: { fullName, email... } -> Form: { fullName... } -> Khớp rồi
        return call({
            name: values.fullName, // Frontend service của bạn đang map 'name' -> 'fullName'
            ...values
        });
    },
    
    // 👇 3. Sửa logic onSuccess
    onSuccess: (res) => { 
      // res chính là object { user, jwt } trả về từ service
      console.log("Register Success Data:", res);

      if (!res || !res.jwt) {
          alert("Đăng ký thành công nhưng không nhận được token.");
          navigate("/login");
          return;
      }

      // Lưu token
      login(res.user, res.jwt); // Tự động đăng nhập sau khi đăng ký thành công
      alert("Đăng ký thành công! Vui lòng xác nhận email. ✅");
      navigate("/verify", { state: { email: form.values.email } });
    },

    // 👇 4. Sửa logic onError
    onError: (err) => {
       console.error("Register Error:", err);
       // Hiển thị lỗi cụ thể từ backend (vd: Email đã tồn tại)
       alert(err.message || "Đăng ký thất bại");
    },
  });

  return {
    ...form,
    apiState: { data, loading, error },
  };
}