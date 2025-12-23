import { useState, useEffect, useRef, useCallback } from "react";

export const useSpeechRecognition = (initialLang = "ko-KR") => {
  const [isListening, setIsListening] = useState(false);
  const [lang, setLang] = useState(initialLang);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const isManualStop = useRef(false);

  // 1. Khởi tạo Engine DUY NHẤT một lần hoặc khi đổi ngôn ngữ
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Trình duyệt không hỗ trợ STT.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interimText = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        } else {
          interimText += event.results[i][0].transcript;
        }
      }
      setInterim(interimText);
      if (finalText) setTranscript((prev) => prev + finalText + " ");
    };

    recognition.onerror = (event) => {
      // Bỏ qua lỗi 'aborted' vì nó xảy ra khi ta chủ động stop quá nhanh
      if (event.error === 'aborted') return;
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      // Chỉ tự động restart nếu không phải do user chủ động Stop
      if (!isManualStop.current) {
        try {
          recognition.start();
        } catch (e) {
          console.error("Auto-restart failed:", e);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    // Cleanup khi component unmount
    return () => {
      isManualStop.current = true;
      recognition.stop();
    };
  }, [lang]); // CHỈ chạy lại khi đổi ngôn ngữ, KHÔNG để isListening ở đây

  // 2. Hàm Start an toàn
  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    setError(null);
    setInterim("");
    isManualStop.current = false;
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      // Nếu engine đang chạy mà gọi start() sẽ lỗi, ta handle nó ở đây
      console.warn("Recognition already started or starting...");
    }
  }, []);

  // 3. Hàm Stop an toàn
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    isManualStop.current = true;
    recognitionRef.current.stop();
    setIsListening(false);
    setInterim("");
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript("");
    setInterim("");
  }, []);

  return {
    isListening, transcript, interim, lang,
    setLang, error, startListening, stopListening, clearTranscript
  };
};