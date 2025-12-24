import React from 'react';
import registerImage from '../../assets/login.png';
import InputComponent from '../../components/InputComponent';
import ButtonComponent from '../../components/ButtonComp';
import { useRegisterForm } from '../../hooks/useRegisterForm';
import { User, Mail, Lock, Phone, MapPinHouse } from 'lucide-react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layout/MainLayout';

export default function Register() {
    const {
        values,
        errors,
        setField,
        handleSubmit,
        loading,
    } = useRegisterForm();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-white shadow-md rounded-xl p-6 md:p-12">

                {/* Image */}
                <div className="flex justify-center items-center">
                    <img
                        src={registerImage}
                        alt="Register illustration"
                        className="w-52 md:w-full h-auto"
                    />
                </div>

                {/* Register Form */}
                <div className="flex flex-col justify-center">
                    <h2 className="text-3xl font-bold mb-2 text-center md:text-left text-gray-800">
                        Register Now!
                    </h2>

                    <p className="mb-6 text-gray-500 text-center md:text-left">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-green-700 font-semibold hover:underline hover:text-green-600 transition"
                        >
                            Sign in
                        </Link>
                    </p>

                    <form onSubmit={handleSubmit}>
                        <InputComponent
                            labelText="Full Name"
                            hintText="Enter your full name"
                            value={values.fullName}
                            onChange={(e) => setField("fullName", e.target.value)}
                            errorText={errors.fullName}
                            prefixIcon={<span className="text-gray-500"><User size={16} /></span>}
                        />

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

                        <InputComponent
                            labelText="Confirm Password"
                            hintText="Re-enter your password"
                            type="password"
                            value={values.confirmPassword}
                            onChange={(e) => setField("confirmPassword", e.target.value)}
                            errorText={errors.confirmPassword}
                            prefixIcon={<span className="text-gray-500"><Lock size={16} /></span>}
                        />

                        <InputComponent
                            labelText="Phone"
                            hintText="Enter your phone number"
                            value={values.phone}
                            onChange={(e) => setField("phone", e.target.value)}
                            errorText={errors.phone}
                            prefixIcon={<span className="text-gray-500"><Phone size={16} /></span>}
                        />

                        <InputComponent
                            labelText="Address"
                            hintText="Enter your address"
                            value={values.address}
                            onChange={(e) => setField("address", e.target.value)}
                            errorText={errors.address}
                            prefixIcon={<span className="text-gray-500"><MapPinHouse size={16} /></span>}
                        />

                        <div className="items-center justify-between mt-6">
                            <ButtonComponent
                                type="submit"
                                text={loading ? "Registering..." : "Register"}
                                fullWidth
                                variant="primary"
                                size="md"
                                color="bg-green-700 hover:bg-green-600 text-white"
                                disabled={loading}
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>

    );
}
