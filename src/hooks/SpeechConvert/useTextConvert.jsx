import { useState, useEffect, useCallback, useRef } from "react";

const detectLangFromText = (text) => {
  if (!text) return null;

  // Korean (Hangul)
  if (/[\uAC00-\uD7AF]/.test(text)) return "ko-KR";

  // Vietnamese (Latin + dấu)
  if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text)) {
    return "vi-VN";
  }

  // English (fallback)
  return "en-US";
};

export const useTextToSpeech = (initialLang = "ko-KR") => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lang, setLang] = useState(initialLang);
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  const currentVoiceRef = useRef(null);

  // Hàm load sẵn giọng nói vào Ref
  const loadVoice = useCallback(() => {
    if (!synth) return;
    const voices = synth.getVoices();
    const voice = voices.find(v => v.lang === lang) || 
                  voices.find(v => v.lang.startsWith(lang.split('-')[0])) ||
                  voices[0];
    currentVoiceRef.current = voice;
  }, [lang, synth]);

  // Lắng nghe sự kiện nạp giọng nói của trình duyệt
  useEffect(() => {
    if (!synth) return;
    loadVoice(); // Load lần đầu
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoice;
    }
  }, [loadVoice, synth]);

  // const speak = useCallback((text) => {
  //   if (!text || !synth) return;

  //   synth.cancel(); // Ngắt mọi tiến trình cũ
    
  //   // Patch: Reset state ngay lập tức để UI nhảy sang màu xanh dương nhanh nhất
  //   setIsSpeaking(false); 

  //   const utterance = new SpeechSynthesisUtterance(text);
  //   utterance.lang = lang;
  //   if (currentVoiceRef.current) {
  //     utterance.voice = currentVoiceRef.current;
  //   }

  //   utterance.onstart = () => setIsSpeaking(true);
  //   utterance.onend = () => setIsSpeaking(false);
  //   utterance.onerror = () => setIsSpeaking(false);

  //   // Kỹ thuật "Force Start": Một số trình duyệt cần resume trước khi speak
  //   synth.resume();
  //   synth.speak(utterance);
  // }, [lang, synth]);
  const speak = useCallback((text) => {
  if (!text || !synth) return;

  synth.cancel();
  setIsSpeaking(false);

  const utterance = new SpeechSynthesisUtterance(text);

  const detectedLang = detectLangFromText(text);
  utterance.lang = detectedLang || lang;

  const voices = synth.getVoices();
  utterance.voice =
    voices.find(v => v.lang === utterance.lang) ||
    voices.find(v => v.lang.startsWith(utterance.lang.split('-')[0])) ||
    currentVoiceRef.current;

  utterance.onstart = () => setIsSpeaking(true);
  utterance.onend = () => setIsSpeaking(false);
  utterance.onerror = () => setIsSpeaking(false);

  synth.resume();
  synth.speak(utterance);
}, [lang, synth]);


  const stop = useCallback(() => {
    if (synth) {
      synth.cancel();
      setIsSpeaking(false);
    }
  }, [synth]);

  return { isSpeaking, speak, stop, setTtsLang: setLang };
};