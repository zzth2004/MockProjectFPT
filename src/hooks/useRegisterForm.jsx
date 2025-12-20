// src/hooks/useRegisterForm.js
import { useNavigate } from "react-router-dom";
import useCallApiHandler from "./HookHander/useCallApiHandler";
import useFormHandler from "./HookHander/useFormHandler";
import { registerApi } from "../services/authService";
import { Validator } from "../utils/Validator";
import { useAuth } from "../context/authContext";

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
    return call({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phone: values.phone,
        address: values.address,
    });
},

    
    // 👇 3. Sửa logic onSuccess
    onSuccess: (res) => { 
      console.log("Register Success Data:", res);

      // KHÔNG gọi login() ở đây vì tài khoản chưa active
      // login(res.user, res.jwt); 
      console.log("Register Success Data:", res);
      alert(`Đăng ký thành công! Mã xác thực đã được gửi đến ${form.values.email}`);
      
      // Chuyển sang trang nhập OTP/Verify
      navigate("/verify", { state: { email: form.values.email } });
    },

    // 👇 4. Logic onError (Bây giờ nó đã hoạt động đúng nhờ sửa registerApi)
    onError: (err) => {
       console.log("Error caught in Hook:", err); // Debug xem lỗi gì

       const serverError = err.response?.data; // Bây giờ cái này sẽ có dữ liệu
    
       let displayMessage = "Đăng ký thất bại";

       if (serverError) {
           // Ưu tiên lấy message từ Backend NestJS
           if (Array.isArray(serverError.message)) {
               displayMessage = serverError.message[0];
           } else if (serverError.message) {
               displayMessage = serverError.message;
           }
       } else if (err.message) {
           // Lỗi Firebase hoặc lỗi mạng
           if(err.code === 'auth/email-already-in-use') {
               displayMessage = "Email này đã được sử dụng trên hệ thống.";
           } else {
               displayMessage = err.message;
           }
       }

       alert(displayMessage);
    },
  });

  return {
    ...form,
    apiState: { data, loading, error },
  };
}