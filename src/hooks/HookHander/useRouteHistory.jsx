// // src/hooks/useRouteHistory.jsx
// import { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";

// // Biến global, tồn tại xuyên suốt app
// let globalHistory = [];
// let globalIndex = -1;

// export function useRouteHistory() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [, setTick] = useState(0); // chỉ để trigger render khi history thay đổi

//   useEffect(() => {
//     // Khi location thay đổi, push vào lịch sử nếu chưa có
//     if (globalHistory[globalIndex] !== location.pathname) {
//       globalHistory = globalHistory.slice(0, globalIndex + 1); // cắt bỏ forward nếu back trước đó
//       globalHistory.push(location.pathname);
//       globalIndex++;
//       setTick(t => t + 1); // trigger render
//     }
//   }, [location.pathname]);

//   const back = () => {
//     if (globalIndex > 0) {
//       globalIndex--;
//       navigate(globalHistory[globalIndex]);
//       setTick(t => t + 1);
//     }
//   };

//   const forward = () => {
//     if (globalIndex < globalHistory.length - 1) {
//       globalIndex++;
//       navigate(globalHistory[globalIndex]);
//       setTick(t => t + 1);
//     }
//   };

//   return {
//     back,
//     forward,
//     canBack: globalIndex > 0,
//     canForward: globalIndex < globalHistory.length - 1,
//   };
// }

// src/hooks/useRouteHistory.jsx
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function useRouteHistory() {
  const navigate = useNavigate();
  const location = useLocation();

  // dùng ref để không gây re-render & không leak state
  const historyRef = useRef([]);
  const indexRef = useRef(-1);

  useEffect(() => {
    const path = location.pathname;

    // tránh push trùng
    if (historyRef.current[indexRef.current] !== path) {
      historyRef.current = historyRef.current.slice(0, indexRef.current + 1);
      historyRef.current.push(path);
      indexRef.current++;
    }
  }, [location.pathname]);

  const go = (path) => {
    // ÉP ABSOLUTE PATH (chốt hạ bug của bạn)
    if (path && typeof path === "string") {
      navigate(path.startsWith("/") ? path : `/${path}`, {
        replace: true,
      });
    }
  };

  const back = () => {
    if (indexRef.current > 0) {
      indexRef.current--;
      go(historyRef.current[indexRef.current]);
    }
  };

  const forward = () => {
    if (indexRef.current < historyRef.current.length - 1) {
      indexRef.current++;
      go(historyRef.current[indexRef.current]);
    }
  };

  return {
    back,
    forward,
    canBack: indexRef.current > 0,
    canForward: indexRef.current < historyRef.current.length - 1,
    history: historyRef.current, // debug nếu cần
  };
}
