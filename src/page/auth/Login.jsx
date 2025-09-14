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

export default function Login() {
    const navigate = useNavigate();
    const {
        values,
        errors,
        setField,
        handleSubmit,
        loading
    } = useLoginForm();

    return (
        <MainLayout>
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
                                value={values.password}
                                onChange={(e) => setField("password", e.target.value)}
                                errorText={errors.password}
                                type="password"
                                prefixIcon={<span className="text-gray-500"><Lock size={16} /></span>}
                            />

                            <div className="flex items-center justify-between mb-4 text-sm">
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" className="accent-green-700" />
                                    <span>Remember me</span>
                                </label>
                                <a
                                    onClick={() => {
                                        if (!values.email) {
                                            alert('Vui lòng nhập email trước');
                                            return;
                                        }
                                        navigate('/reset-pass', { state: { email: values.email } });
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

                        <div className="flex items-center m-4 gap-4">
                            <hr className="flex-grow border-gray-300" />
                            <p className="text-sm text-gray-500 text-center whitespace-nowrap">
                                or sign in with
                            </p>
                            <hr className="flex-grow border-gray-300" />
                        </div>

                        <ButtonComponent
                            text="Sign in with Google"
                            variant="secondary"
                            size="md"
                            fullWidth
                            color="bg-gray-200 hover:bg-green-700 hover:text-white border border-gray-300"
                            icon={
                                <img
                                    src={ggImage}
                                    alt="Google"
                                    className="w-5 h-5"
                                />
                            }
                            onClick={() => {
                                console.log("Google sign in clicked");
                            }}
                        />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
