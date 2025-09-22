// src/hooks/useRouteHistory.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Biến global, tồn tại xuyên suốt app
let globalHistory = [];
let globalIndex = -1;

export function useRouteHistory() {
  const navigate = useNavigate();
  const location = useLocation();

  const [, setTick] = useState(0); // chỉ để trigger render khi history thay đổi

  useEffect(() => {
    // Khi location thay đổi, push vào lịch sử nếu chưa có
    if (globalHistory[globalIndex] !== location.pathname) {
      globalHistory = globalHistory.slice(0, globalIndex + 1); // cắt bỏ forward nếu back trước đó
      globalHistory.push(location.pathname);
      globalIndex++;
      setTick(t => t + 1); // trigger render
    }
  }, [location.pathname]);

  const back = () => {
    if (globalIndex > 0) {
      globalIndex--;
      navigate(globalHistory[globalIndex]);
      setTick(t => t + 1);
    }
  };

  const forward = () => {
    if (globalIndex < globalHistory.length - 1) {
      globalIndex++;
      navigate(globalHistory[globalIndex]);
      setTick(t => t + 1);
    }
  };

  return {
    back,
    forward,
    canBack: globalIndex > 0,
    canForward: globalIndex < globalHistory.length - 1,
  };
}
