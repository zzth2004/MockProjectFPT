import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Volume2, Clock, Pause, Play, RotateCcw, Info } from "lucide-react";

// --- MOCK DATA ---
const MOCK_PARTS_DB = {
  '1': { type: 'LISTENING', title: "Part 1 - Correct answer" },
  '9': { type: 'READING', title: "Part 1 - Sentence topic" },
  '220': { type: 'WRITTING', title: "Express personal opinion" },
};

const MOCK_QUESTIONS = {
  LISTENING: [
    {
      id: "q1",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      questionText: "Question 1: What is the man talking about?",
      options: [
        { id: 1, text: "네, 시장이에요. (Yes, it's a market.)" },
        { id: 2, text: "네, 시장이 좋아요. (Yes, I like the market.)" },
        { id: 3, text: "아니요, 시장에 안 가요. (No, I don't go to the market.)" },
        { id: 4, text: "아니요, 시장에 있어요. (No, I am at the market.)" },
      ],
    },
  ],
  READING: [
    {
      id: "r1",
      passageText: "저는 어제 친구와 함께 영화를 봤습니다. 영화가 아주 재미있었습니다. 영화를 본 후에 우리는 같이 저녁을 먹었습니다.",
      questionText: "Question 1: 이 사람은 어제 무엇을 했습니까?",
      options: [
        { id: 1, text: "친구를 만났습니다." },
        { id: 2, text: "집에서 쉬었습니다." },
        { id: 3, text: "혼자 영화를 봤습니다." },
        { id: 4, text: "도서관에 갔습니다." },
      ],
    },
  ],
  WRITTING: [
    {
      id: "w1",
      questionText: "흡연은 폐암과 같은 질병을 유발할 수 있으며, 흡연자 본인뿐만 아니라 간접 흡연을 하게 되는 주변 사람들에게도 피해를 끼칠 수 있습니다. 이러한 위험성 때문에 흡연율을 낮추기 위한 사회적 대책이 마련되고 있는데, 담뱃값 인상이 그중 한 가지 방법입니다. '담뱃값 인상과 흡연율의 관계'에 대해 아래의 내용을 중심으로 자신의 생각을 쓰십시오.\n• 흡연으로 인한 피해는 어떤 것이 있는가?\n• 담뱃값 인상이 흡연율에 영향을 미치는가? 그렇게 생각하는 이유는 무엇인가?",
      suggestion: "Đây là bài mẫu gợi ý: '흡연은 건강에 해로울 뿐만 아니라...'",
    }
  ]
};

const TopikTestPage = () => {
  const navigate = useNavigate();
  const { partId } = useParams();
  const location = useLocation();
  const { testMode, autoNext, questionCount } = location.state || { testMode: false, questionCount: 10 };

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // Cho trắc nghiệm
  const [writingAnswer, setWritingAnswer] = useState(""); // Cho tự luận
  const [timeLeft, setTimeLeft] = useState(40 * 60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef(null);

  const currentPartInfo = MOCK_PARTS_DB[partId] || { type: 'LISTENING', title: 'Unknown Part' };
  const testType = currentPartInfo.type;

  let questionsList = MOCK_QUESTIONS[testType] || [];
  while (questionsList.length < questionCount && questionsList.length > 0) {
    questionsList = [...questionsList, ...questionsList];
  }
  const questions = questionsList.slice(0, questionCount);
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  useEffect(() => {
    if (!testMode) return;
    const timer = setInterval(() => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [testMode]);

  useEffect(() => {
    if (testType === 'LISTENING' && audioRef.current) {
      audioRef.current.currentTime = 0;
      setAudioProgress(0);
      setIsPlaying(false);
    }
  }, [currentQuestionIndex, testType]);

  const handleSelectAnswer = (optionId) => {
    setUserAnswers({ ...userAnswers, [currentQuestionIndex]: optionId });
    if (autoNext && currentQuestionIndex < totalQuestions - 1) {
      setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 500);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (!currentQuestion) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="w-full min-h-screen bg-[#F8F9FC] flex flex-col font-sans p-4 md:p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 font-bold hover:text-gray-900 transition-colors">
          <ChevronLeft size={24} /> Back
        </button>
        <div className="flex-1 max-w-2xl mx-auto flex items-center gap-4">
          <span className="font-extrabold text-xl">{currentQuestionIndex + 1} / {totalQuestions}</span>
          <div className="h-3 bg-gray-200 rounded-full flex-1 overflow-hidden">
            <div className="h-full bg-[#377437] transition-all" style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}></div>
          </div>
        </div>
        {testMode && <div className="bg-green-50 text-[#377437] px-4 py-2 rounded-full font-bold flex items-center gap-2">
          <Clock size={18} /> {formatTime(timeLeft)}
        </div>}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* LEFT COLUMN */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* QUESTION BOX */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 relative flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold">Question {currentQuestionIndex + 1}</h2>
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full"><RotateCcw size={20}/></button>
                <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full"><Info size={20}/></button>
              </div>
            </div>

            {/* LISTENING UI */}
            {testType === 'LISTENING' && (
              <div className="bg-[#E9F5EB] rounded-2xl p-4 mb-8 flex items-center gap-4">
                <button onClick={togglePlay} className="w-12 h-12 bg-[#377437] text-white rounded-full flex items-center justify-center">
                  {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>
                <div className="flex-1 h-2 bg-green-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#377437]" style={{ width: `${audioProgress}%` }}></div>
                </div>
                <audio ref={audioRef} src={currentQuestion.audioUrl} onTimeUpdate={() => setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100)} onEnded={() => setIsPlaying(false)} />
              </div>
            )}

            {/* READING UI (Passage) */}
            {testType === 'READING' && currentQuestion.passageText && (
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8 text-lg leading-relaxed whitespace-pre-line">
                {currentQuestion.passageText}
              </div>
            )}

            <h3 className="text-xl font-bold mb-6 whitespace-pre-line">{currentQuestion.questionText}</h3>

            {/* OPTIONS (LISTENING/READING) */}
            {testType !== 'WRITTING' && (
              <div className="flex flex-col gap-4">
                {currentQuestion.options.map((option) => (
                  <div key={option.id} onClick={() => handleSelectAnswer(option.id)} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${userAnswers[currentQuestionIndex] === option.id ? 'border-[#377437] bg-green-50' : 'border-gray-200'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border ${userAnswers[currentQuestionIndex] === option.id ? 'bg-[#377437] text-white' : 'bg-white text-gray-400'}`}>{option.id}</div>
                    <span className="text-lg">{option.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* WRITING UI (TextArea) */}
            {testType === 'WRITTING' && (
              <div className="mt-4">
                <h4 className="text-lg font-bold mb-3">Your Answer</h4>
                <textarea 
                  value={writingAnswer} 
                  onChange={(e) => setWritingAnswer(e.target.value)}
                  placeholder="Enter your answer here..."
                  className="w-full h-64 p-6 rounded-2xl border-2 border-gray-100 focus:border-[#377437] outline-none text-lg resize-none transition-all"
                />
              </div>
            )}
          </div>

          {/* BOTTOM NAV */}
          <div className="flex justify-between items-center px-4">
            <button onClick={() => setCurrentQuestionIndex(prev => prev - 1)} disabled={currentQuestionIndex === 0} className="flex items-center gap-2 text-gray-500 font-bold disabled:opacity-30"><ChevronLeft /> Previous</button>
            <button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} disabled={currentQuestionIndex === totalQuestions - 1} className="flex items-center gap-2 text-gray-500 font-bold disabled:opacity-30">Next <ChevronRight /></button>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6">
          {testType === 'WRITTING' ? (
            <div className="bg-[#E9F5EB] rounded-[2rem] p-8 border border-green-100 flex flex-col items-center text-center gap-4">
              <img src="https://cdn-icons-png.flaticon.com/512/4322/4322991.png" alt="Ninja" className="w-32 h-32 object-contain" />
              <h3 className="text-xl font-extrabold text-[#377437]">Try the suggestion</h3>
              <button onClick={() => alert(currentQuestion.suggestion)} className="w-full py-4 bg-[#377437] text-white font-extrabold rounded-2xl shadow-lg">View suggestion now</button>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 bg-gray-50 font-extrabold text-center border-b">Answer Sheet</div>
              <div className="p-6 grid grid-cols-5 gap-4 overflow-y-auto max-h-[400px]">
                {questions.map((_, i) => (
                  <button key={i} onClick={() => setCurrentQuestionIndex(i)} className={`w-11 h-11 rounded-full font-bold flex items-center justify-center border-2 transition-all ${currentQuestionIndex === i ? 'border-[#377437] text-[#377437]' : userAnswers[i] ? 'bg-[#377437] text-white border-[#377437]' : 'bg-gray-50 text-gray-400 border-transparent'}`}>
                    {userAnswers[i] || i + 1}
                  </button>
                ))}
              </div>
              <div className="p-6 border-t">
                <button onClick={() => alert('Nộp bài thành công!')} className="w-full py-4 bg-[#377437] text-white font-extrabold rounded-2xl shadow-lg">Submit</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopikTestPage;