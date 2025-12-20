import axiosClient from "../api/axiosAPI.jsx";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile,
  deleteUser, updatePassword,
} from "firebase/auth";
import { auth } from "../firebase/firebase.js"; 

export async function registerApi({ name, email, password, phone, address }) {
  let firebaseUser = null;
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    firebaseUser = userCredential.user;

    await updateProfile(firebaseUser, { displayName: name });
    const idToken = await firebaseUser.getIdToken();

    const res = await axiosClient.post("/auth/register", {
      firebaseToken: idToken,
      email,
      fullName: name,
      phone,
      address,
    });

    console.log("🔥 Raw Response:", res);

    // === HANDLE ALL POSSIBLE RESPONSE SHAPES ===
    
    // Case 1: axios not intercepted
    if (res?.data?.data?.user && res?.data?.data?.jwt) {
      return res.data.data;
    }

    // Case 2: axios intercepted (res is body)
    if (res?.data?.user && res?.data?.jwt) {
      return res.data;
    }

    // Case 3: fallback
    console.warn("⚠️ Unexpected API response, returning full:", res);
    return res;

  } catch (err) {
    if (firebaseUser) await deleteUser(firebaseUser).catch(() => {});
    console.error("❌ registerApi Error:", err);
    throw err;
  }
}




// ================= LOGIN EMAIL/PASS =================
export async function loginApi({ email, password }) {
  try {
    console.log("📌 [loginApi] Start login:", email);

    // 1️⃣ Login Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // 2️⃣ Lấy ID Token
    const idToken = await firebaseUser.getIdToken();

    // 3️⃣ Gọi Backend
    const res = await axiosClient.post("/auth/login", {
      firebaseToken: idToken,
    });

    console.log("✅ [loginApi] Raw Response:", res.data);

    if (res.status !== "success") {
      throw new Error("Login failed!");
    }

    const finalData = res.data; // { user, jwt }

    console.log("🟢 [loginApi] Final Data:", finalData);

    return finalData;

  } catch (err) {
    console.error("❌ [loginApi] Error:", err.response?.data || err.message);
    throw new Error(err.response?.data?.message || 'Email hoặc mật khẩu không đúng');
  }
}


// ================= LOGIN GOOGLE =================
export async function loginWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();

    // 1️⃣ Popup Google
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;

    // 2️⃣ Lấy Token
    const idToken = await firebaseUser.getIdToken();

    // 3️⃣ Gọi Backend (Backend sẽ tự tạo user nếu chưa có)
    const res = await axiosClient.post("/auth/login", {
      firebaseToken: idToken,
    });

    // 🟢 Trả về data thực
    return res.data; 

  } catch (err) {
    console.error("❌ [GoogleLogin] Error:", err);
    throw new Error(err.response?.data?.message || 'Đăng nhập Google thất bại');
  }
}
export async function verifyCodeApi(payload) {
  console.log("📩 verifyCodeApi gọi với payload:", payload);

  const { email, otp } = payload;
  try {
    // Backend API expects: { email: string, code: string }
    const res = await axiosClient.post("/auth/verify-code", { 
      email, 
      code: otp // Map 'otp' từ form sang 'code' của backend
    });

    // 🟢 QUAN TRỌNG: 
    // Vì Backend dùng Interceptor trả về { status, code, data }
    // Nên dữ liệu thực sự nằm ở res.data.data
    console.log("✅ verifyCodeApi thành công:", res.data);
    return res.data; 

  } catch (err) {
    console.error('❌ verifyCodeApi error:', err.response?.data || err.message);
    
    // Ném ra message lỗi cụ thể để UI hiển thị
    // err.response?.data?.message thường là message từ NestJS (BadRequestException)
    throw new Error(err.response?.data?.message || 'Mã xác thực không đúng hoặc đã hết hạn');
  }
}

export async function resendCodeApi(email) {
  console.log("📩 resendCodeApi gửi lại OTP cho:", email);
  try {
    const res = await axiosClient.post("/auth/resend-code", { email });
    
    // Backend hàm này trả về void (hoặc null), nên return true để báo thành công
    return true; 
    
  } catch (err) {
    console.error('❌ resendCodeApi error:', err.response?.data || err.message);
    throw new Error(err.response?.data?.message || 'Không thể gửi lại mã. Vui lòng thử lại sau.');
  } 

  
}
export async function updatePasswordAPI({ email, newPassword, code}) {
    try {
      const res = await axiosClient.post("/auth/update-password", {
        email,
        newPassword,
        code
      });    
      if (auth.currentUser) {
        try {
          await signOut(auth);
        } catch (signOutError) {
          // Bỏ qua lỗi signOut vì token đã bị revoke
          console.log("Token already revoked, signing out locally");
        }
      }

      return res.data.data; 

    } catch (err) {
      console.error("❌ [updatePasswordAPI] Error:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Cập nhật mật khẩu thất bại');
    }   
}