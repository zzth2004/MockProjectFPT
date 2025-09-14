// src/hooks/useVerifyCodeForm.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useCallApiHandler from "./HookHander/useCallApiHandler";
import useFormHandler from "./HookHander/useFormHandler";
import { verifyCodeApi, resendCodeApi } from "../services/authService";

export function useVerifyCodeForm(initialEmail = "") {
  const navigate = useNavigate();
  const { data, loading, error, call } = useCallApiHandler(verifyCodeApi);
  const { call: resendCall } = useCallApiHandler(resendCodeApi);

  const [resendMessage, setResendMessage] = useState("");

  const form = useFormHandler({
    initialValues: {
      email: initialEmail, // readonly field
      otp: "",
    },
    validators: {
      otp: (val) => (!val.trim() ? "Mã xác nhận không được để trống" : null),
    },
    apiFn: call,
    onSuccess: () => {
      alert("Xác minh thành công ✅");
      navigate("/login");
    },
    onError: (err) => {
      console.error("Verify error:", err);
      alert(err);
    },
  });

  const resendCode = async () => {
    try {
      const res = await resendCall(form.values.email);
      if (res.success) {
        setResendMessage(res.message);
        setTimeout(() => setResendMessage(""), 3000);
      }
    } catch (err) {
      setResendMessage("Gửi lại OTP thất bại");
    }
  };

  return {
    ...form,
    resendMessage,
    resendCode,
    apiState: { data, loading, error },
  };
}
