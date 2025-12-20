import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCallApiHandler from "./HookHander/useCallApiHandler";
import useFormHandler from "./HookHander/useFormHandler";
import { verifyCodeApi, resendCodeApi } from "../services/authService";
import { useAuth } from "../context/authContext";
// 👇 Thêm tham số type
export function useVerifyCodeForm(initialEmail = "", type = "REGISTER") {
  const navigate = useNavigate();
  const { data, loading, error, call } = useCallApiHandler(verifyCodeApi);
  const { call: resendCall, loading: resendLoading } = useCallApiHandler(resendCodeApi);

  const [resendMessage, setResendMessage] = useState("");
  const [countdown, setCountdown] = useState(0);

  const { login } = useAuth();

  // Logic đếm ngược (Giữ nguyên)
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const form = useFormHandler({
    initialValues: {
      email: initialEmail,
      otp: "",
    },
    validators: {
      otp: (val) => (!val.trim() ? "Mã xác nhận không được để trống" : null),
    },
    apiFn: call,
    onSuccess: (res) => {
      // 👇 LOGIC CHIA NHÁNH Ở ĐÂY
      if (type === "FORGOT_PASSWORD") {
        // Nhánh 1: Quên mật khẩu -> Chuyển sang trang đặt lại mật khẩu
        alert("Xác thực thành công. Vui lòng đặt lại mật khẩu.");
        navigate("/reset-pass", {
          state: { email: initialEmail } // 
        });
      } else {
        alert("Kích hoạt tài khoản thành công! ✅");

        login(res.user, res.jwt);
        const role = user.role?.toLowerCase();
        console.log("User role:", role);

        switch (role) {
          case "admin":
            navigate("/admin", { replace: true });
            break;
          case "teacher":
            navigate("/teacher/dashboard", { replace: true });
            break;
          case "student":
            navigate("/user/dashboard", { replace: true });
            break;
          default:
            navigate("/", { replace: true });
            break;
        }
      }
    },
    onError: (err) => {
      console.error("Verify error:", err);
    },
  });

  const resendCode = async () => {
    if (countdown > 0) return;
    setResendMessage("");
    try {
      const res = await resendCall(form.values.email);
      if (res) {
        setResendMessage(`Đã gửi lại mã tới ${form.values.email}`);
        setCountdown(60);
        setTimeout(() => setResendMessage(""), 5000);
      }
    } catch (err) {
      setResendMessage("Gửi lại OTP thất bại. Vui lòng thử lại.");
    }
  };

  return {
    ...form,
    resendMessage,
    resendCode,
    countdown,
    resendLoading,
    apiState: { data, loading, error },
  };
}