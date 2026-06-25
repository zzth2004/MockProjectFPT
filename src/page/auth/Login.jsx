// src/page/auth/Login.jsx
import React from 'react';
import loginImage from '../../assets/login.png';
import ggImage from '../../assets/ggLogo2.png';
import InputComponent from '../../components/InputComponent';
import ButtonComponent from '../../components/ButtonComp';
import { Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../layout/MainLayout';
import { useLoginForm } from '../../hooks/useLoginForm';
import { loginWithGoogle } from '../../services/authService';
import { useAuth } from '../../context/authContext';
import { resendCodeApi } from '../../services/authService';
import useCallApiHandler from '../../hooks/HookHander/useCallApiHandler';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { call: sendOtpCall, loading: sendingOtp } = useCallApiHandler(resendCodeApi);
    const handleForgotPassword = async () => {
        // 1. Lấy email từ form (giả sử bạn đang dùng biến values từ form handler)
        const email = values.email;

        // 2. Validate
        if (!email) {
            alert('Vui lòng nhập email của bạn vào ô bên trên để lấy lại mật khẩu.');
            return;
        }

        try {
            // 3. Gọi API gửi mã
            // Hàm này sẽ gọi backend gửi mail chứa OTP
            const res = await sendOtpCall(email);

            // 4. Nếu thành công -> Chuyển hướng
            if (res) {
                alert(`Mã xác thực đã được gửi tới ${email}`);
                navigate("/verify", {
                    state: {
                        email: email,
                        type: "FORGOT_PASSWORD" // Đánh dấu là luồng quên mật khẩu
                    }
                });
            }
        } catch (err) {
            // Lỗi đã được useCallApiHandler log, ở đây chỉ cần báo UI
            console.error("Forgot password error:", err);
            // alert("Không tìm thấy email hoặc lỗi hệ thống."); // Tùy chọn
        }
    };
    // Hook xử lý đăng nhập Google
    const handleGoogleLogin = async () => {
        try {
            const res = await loginWithGoogle();
            console.log("Dữ liệu phản hồi:", res);

            // Lấy user và jwt an toàn bất kể backend trả về bọc trong data hay không
            const user = res?.user || res?.data?.user;
            const jwt = res?.jwt || res?.data?.jwt;

            if (!user || !jwt) {
                console.error("Dữ liệu trả về thiếu user hoặc jwt:", res);
                alert("Lỗi hệ thống: Không nhận được thông tin người dùng.");
                return;
            }

            login(user, jwt);
            navigate("/user/dashboard", { replace: true });

        } catch (err) {
            console.error("Google login error:", err);
            alert("Đăng nhập Google thất bại ❌");
        }
    };

    // Hook xử lý form email/password
    const { values, errors, setField, handleSubmit, loading } = useLoginForm();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-white shadow-md rounded-xl p-6 md:p-12">

                {/* Image */}
                <div className="flex justify-center items-center">
                    <img
                        src={loginImage}
                        alt="Teacher illustration"
                        className="w-52 md:w-full h-auto"
                    />
                </div>

                {/* Login Form */}
                <div className="flex flex-col justify-center">
                    <h2 className="text-3xl font-bold mb-2 text-center md:text-left text-gray-800">
                        Welcome back!
                    </h2>
                    <p className="mb-6 text-gray-500 text-center md:text-left">
                        Don’t have an account?{" "}
                        <Link
                            to="/register"
                            className="text-green-700 font-semibold hover:underline hover:text-green-600 transition"
                        >
                            Sign up
                        </Link>
                    </p>

                    <form onSubmit={handleSubmit}>
                        <InputComponent
                            labelText="Email"
                            hintText="Enter your email"
                            value={values.email}
                            onChange={(e) => setField("email", e.target.value)}
                            errorText={errors.email}
                            prefixIcon={<span className="text-gray-500"><Mail size={16} /></span>}
                        />

                        <InputComponent
                            labelText="Password"
                            hintText="Enter your password"
                            type="password"
                            value={values.password}
                            onChange={(e) => setField("password", e.target.value)}
                            errorText={errors.password}
                            prefixIcon={<span className="text-gray-500"><Lock size={16} /></span>}
                        />

                        <div className="flex items-center justify-between mb-4 text-sm">
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" className="accent-green-700" />
                                <span>Remember me</span>
                            </label>
                            <a
                                onClick={(e) => {
                                    e.preventDefault(); // Ngăn hành vi mặc định của thẻ a
                                    if (!sendingOtp) {
                                        handleForgotPassword();
                                    }
                                }}
                                className="text-green-700 hover:underline cursor-pointer"
                            >
                                Forget password?
                            </a>
                        </div>

                        <ButtonComponent
                            type="submit"
                            text={loading ? "Signing In..." : "Sign In"}
                            fullWidth
                            variant="primary"
                            size="md"
                            disabled={loading}
                            color="bg-green-700 hover:bg-green-600 text-white"
                        />
                    </form>

                    {/* Divider */}
                    <div className="flex items-center m-4 gap-4">
                        <hr className="flex-grow border-gray-300" />
                        <p className="text-sm text-gray-500 text-center whitespace-nowrap">
                            or sign in with
                        </p>
                        <hr className="flex-grow border-gray-300" />
                    </div>

                    {/* Google login */}
                    <ButtonComponent
                        text="Sign in with Google"
                        variant="secondary"
                        size="md"
                        fullWidth
                        color="bg-gray-200 hover:bg-green-700 hover:text-white border border-gray-300"
                        icon={<img src={ggImage} alt="Google" className="w-5 h-5" />}
                        onClick={handleGoogleLogin}
                    />
                </div>
            </div>
        </div>
    );
}
