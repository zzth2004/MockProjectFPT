import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useCallApiHandler from "./HookHander/useCallApiHandler";
import useFormHandler from "./HookHander/useFormHandler";
import { updatePasswordAPI } from "../services/authService"; // Import API đổi mật khẩu
import { Validator } from "../utils/Validator";

export function useResetPassForm() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. Lấy thông tin "bằng chứng" từ trang Verify chuyển sang
  const { email} = location.state || {};

  // 2. Gọi API reset password
  const { data, loading, error, call } = useCallApiHandler(updatePasswordAPI);

  // 3. Bảo vệ route: Nếu không có email/code (truy cập lậu), đá về login
  useEffect(() => {
    if (!email) {
      console.warn("Thiếu thông tin xác thực, chuyển về login");
      navigate("/login");
    }
  }, [email, navigate]);

  const form = useFormHandler({
    initialValues: {
      code: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      password: (val) => Validator.validatePassword(val),
      confirmPassword: (val, values) =>
        val !== values.password ? "Mật khẩu xác nhận không khớp" : null,
      code: (val) => {
        if (!val || val.length !== 5) {
          return "Mã xác thực phải đúng 5 ký tự";
        }
        return null;
      },
    },
    // 👇 4. Chuẩn bị dữ liệu gửi lên Backend
    apiFn: (values) => {
      // Form chỉ có password, ta phải trộn thêm email và code từ state
      return call({
        email: email,
        code: String(values.code),
        newPassword: values.password, 
      });
    },
    
    // 👇 5. Xử lý thành công
    onSuccess: (res) => {
      console.log("Reset Password Success:", res);
      alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới. ✅");
      
      // Chuyển hướng về trang đăng nhập
      navigate("/login", { replace: true });
    },

    // 👇 6. Xử lý lỗi
    onError: (err) => {
       console.error("Reset Password Error:", err);
       alert(err.message || "Đổi mật khẩu thất bại. Mã xác thực có thể đã hết hạn.");
    },
  });

  return {
    ...form,
    email, // Trả về email để hiển thị lên UI (vd: "Đặt lại mật khẩu cho abc@gmail.com")
    apiState: { data, loading, error },
  };
}