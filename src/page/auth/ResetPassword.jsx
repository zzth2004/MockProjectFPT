import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import InputComponent from '../../components/InputComponent';
import ButtonComponent from '../../components/ButtonComp';
import { Lock } from 'lucide-react';
import resetImage from '../../assets/login.png'; // 👈 import ảnh minh hoạ
import { Validator } from '../../utils/Validator';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const emailHidden = Validator.validateEmailHidden(email);


  useEffect(() => {
    if (!email) {
      navigate('/404'); // Nếu không có email, chuyển đến trang lỗi
    }
  }, [email, navigate]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ mật khẩu.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    console.log('Đổi mật khẩu cho:', email, 'Mật khẩu mới:', password);
    // TODO: Gửi API đổi mật khẩu

    navigate('/login'); // quay lại đăng nhập
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-white shadow-md rounded-xl p-6 md:p-12">
        
        {/* Hình minh hoạ */}
        <div className="flex justify-center items-center">
          <img
            src={resetImage}
            alt="Reset illustration"
            className="w-52 md:w-full h-auto"
          />
        </div>

        {/* Form Reset Password */}
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-4 text-center md:text-left text-gray-800">
            Reset Your Password
          </h2>
          <p className="text-sm text-gray-500 mb-4 text-center md:text-left">
            Mã xác thực đã được gửi đến: <span className="font-semibold">{emailHidden}</span>
          </p>

          <form onSubmit={handleSubmit}>
            <InputComponent
              labelText="New Password"
              hintText="Enter new password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              prefixIcon={<span className="text-gray-500"><Lock size={16} /></span>}
            />

            <InputComponent
              labelText="Confirm Password"
              hintText="Re-enter new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              prefixIcon={<span className="text-gray-500"><Lock size={16} /></span>}
            />

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <ButtonComponent
              type="submit"
              text="Reset Password"
              fullWidth
              variant="primary"
              size="md"
              color="bg-green-700 hover:bg-green-600 text-white mt-4"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
