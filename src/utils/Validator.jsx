import React from 'react'

export class Validator {

  static validateEmail(value) {
    if (!value || value.trim() === "") {
      return "Email not null or empty";
    }
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!pattern.test(value)) {
      return "Email không hợp lệ";
    }
    return null;
  }

  // Validate nickname
  static validateNickname(value) {
    const trimmed = value.trim();
    const badWords = [
      'fuck', 'shit', 'bitch', 'ass', 'damn', 'dmm', 'clmm', 'cc', 'ditme', 'ngu',
      'dog', 'concho', 'lon', 'ditbo', 'cailon', 'ml', 'vl', 'dkm'
    ];

    if (!trimmed) {
      return "Nickname không được để trống";
    }

    if (trimmed.length > 15) {
      return "Nickname không được dài quá 15 ký tự";
    }

    const lower = trimmed.toLowerCase();
    for (let bad of badWords) {
      if (lower.includes(bad)) {
        return "Nickname không được chứa từ ngữ không phù hợp";
      }
    }

    return null;
  }

  static validatePassword(value) {
    if (!value || value.trim() === "") {
      return "Mật khẩu không được để trống";
    }

    if (value.length < 8) {
      return "Mật khẩu phải ít nhất 8 ký tự";
    }

    if (/\s/.test(value)) {
      return "Mật khẩu không được chứa khoảng trắng";
    }

    if (!/[A-Z]/.test(value)) {
      return "Mật khẩu phải chứa ít nhất một chữ cái viết hoa";
    }

    if (!/[a-z]/.test(value)) {
      return "Mật khẩu phải chứa ít nhất một chữ cái viết thường";
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      return "Mật khẩu phải chứa ít nhất một ký tự đặc biệt";
    }

    return null;
  }

  // Validate username
  static validateUsername(value) {
    if (!value || value.trim() === "") {
      return "Username không được để trống";
    }
    return null;
  }

  // Validate phone
  static validatePhone(value) {
    if (!value || value.trim() === "") {
      return "Số điện thoại không được để trống";
    }
    if (!/^\d{9,11}$/.test(value)) {
      return "Số điện thoại không hợp lệ";
    }
    return null;
  }

  // Validate fullname
  static validateFullname(value) {
    if (!value || value.trim() === "") {
      return "Full name không được để trống";
    }
    return null;
  }

  static validateEmailHidden(value) {
  if (!value || value.trim() === "") {
    return "Email not null or empty";
  }

  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!pattern.test(value)) {
    return "Email không hợp lệ";
  }

  // Xử lý ẩn email
  const [localPart, domain] = value.split("@");
  if (localPart.length <= 2) {
    return localPart + "***@" + domain;
  } else {
    const visible = localPart.slice(0, 2);
    return visible + "***@" + domain;
  }
}

}
