export async function registerApi(payload) {
  console.log("📩 registerApi gọi với payload:", payload);

  await new Promise((resolve) => setTimeout(resolve, 1200));

  if (payload.email === "test@example.com") {
    throw new Error("Email đã được sử dụng");
  }

  return {
    success: true,
    user: {
      id: Date.now(),
      name: payload.name,
      email: payload.email,
    },
    token: "fake-jwt-token-123",
  };
}


export async function loginApi(payload) {
  console.log("🔑 loginApi gọi với payload:", payload);

  await new Promise((resolve) => setTimeout(resolve, 1000));


  if (payload.email !== "user@example.com" || payload.password !== "Pass123@") {
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  return {
    success: true,
    user: {
      id: 1,
      name: "Demo User",
      email: payload.email,
    },
    token: "fake-jwt-token-xyz",
  };
}
export async function verifyCodeApi(payload) {
  console.log("📩 verifyCodeApi gọi với payload:", payload);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (payload.otp !== "123456") {
    throw new Error("Mã OTP không hợp lệ");
  }

  return {
    success: true,
    message: "Xác minh thành công",
  };
}

export async function resendCodeApi(email) {
  console.log("📩 resendCodeApi gửi lại OTP cho:", email);

  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    success: true,
    message: "Mã xác nhận đã được gửi lại!",
  };
}
