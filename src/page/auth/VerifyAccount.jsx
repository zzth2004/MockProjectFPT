import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

import verifyImage from "../../assets/login.png";
import InputComponent from "../../components/InputComponent";
import ButtonComponent from "../../components/ButtonComp";
import { useVerifyCodeForm } from "../../hooks/useVerifyCodeForm";

export default function VerifyAccount() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email;

  useEffect(() => {
    if (!emailFromState) navigate("/404");
  }, [emailFromState, navigate]);

  const {
    values,
    errors,
    setField,
    handleSubmit,
    resendMessage,
    resendCode,
    apiState,
  } = useVerifyCodeForm(emailFromState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-white shadow-md rounded-xl p-6 md:p-12">
        
        {/* Image */}
        <div className="flex justify-center items-center">
          <img
            src={verifyImage}
            alt="Verification illustration"
            className="w-52 md:w-full h-auto"
          />
        </div>

        {/* Verify Form */}
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-2 text-center md:text-left text-gray-800">
            Verify Your Account
          </h2>

          <p className="mb-2 text-gray-600 text-sm text-center md:text-left">
            Mã xác nhận đã được gửi đến <strong>{emailFromState}</strong>. 
            Vui lòng kiểm tra email và nhập mã OTP bên dưới.
          </p>

          {resendMessage && (
            <p className="text-green-600 mb-2 text-sm">{resendMessage}</p>
          )}

          <form onSubmit={handleSubmit}>
            <InputComponent
              labelText="Mã xác nhận"
              hintText="Nhập mã 6 chữ số"
              value={values.otp}
              onChange={(e) => setField("otp", e.target.value)}
              errorText={errors.otp}
              prefixIcon={<Lock size={16} className="text-gray-500" />}
            />

            <ButtonComponent
              type="submit"
              text={apiState.loading ? "Đang xác minh..." : "Xác minh"}
              disabled={apiState.loading}
              fullWidth
              variant="primary"
              size="md"
              color="bg-green-700 hover:bg-green-600 text-white"
            />

            <button
              type="button"
              onClick={resendCode}
              className="text-sm mt-3 text-green-700 hover:underline"
            >
              Gửi lại mã xác nhận
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
