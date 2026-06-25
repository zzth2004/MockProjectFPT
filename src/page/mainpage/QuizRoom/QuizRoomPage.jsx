import React, { useState, useEffect } from 'react';
import { Play, Users, Clock, Trophy, ChevronRight, CheckCircle2, XCircle, LogOut } from 'lucide-react';

// --- MOCK DATA ---
const MOCK_QUESTIONS = [
  {
    id: 1,
    question: 'Từ nào sau đây có nghĩa là "Trường học" trong tiếng Hàn?',
    options: ['학교 (Hakgyo)', '병원 (Byeongwon)', '식당 (Sikdang)', '회사 (Hoesa)'],
    answer: 0,
    time: 15,
  },
  {
    id: 2,
    question: 'Câu "안녕하세요" dùng để làm gì?',
    options: ['Tạm biệt', 'Xin chào', 'Cảm ơn', 'Xin lỗi'],
    answer: 1,
    time: 10,
  },
  {
    id: 3,
    question: 'Định dạng ngữ pháp cơ bản của tiếng Hàn là gì?',
    options: ['S-V-O (Chủ-Động-Tân)', 'S-O-V (Chủ-Tân-Động)', 'V-S-O (Động-Chủ-Tân)', 'V-O-S (Động-Tân-Chủ)'],
    answer: 1,
    time: 20,
  },
];

const COLORS = [
  { bg: 'bg-red-500', hover: 'hover:bg-red-600', shadow: 'shadow-red-600', icon: '🔺' },
  { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', shadow: 'shadow-blue-600', icon: '🔷' },
  { bg: 'bg-yellow-400', hover: 'hover:bg-yellow-500', shadow: 'shadow-yellow-500', icon: '🟡' },
  { bg: 'bg-green-500', hover: 'hover:bg-green-600', shadow: 'shadow-green-600', icon: '🟩' },
];

export default function QuizRoomPage() {
  const [phase, setPhase] = useState('lobby'); // lobby -> waiting -> playing -> result
  
  // Lobby state
  const [roomCode, setRoomCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  // Waiting state
  const [players, setPlayers] = useState([]);

  // Playing state
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [score, setScore] = useState(0);

  // --- ACTIONS ---
  const handleJoin = (e) => {
    e.preventDefault();
    if (roomCode.length < 4) {
      setError('Mã phòng phải có ít nhất 4 ký tự!');
      return;
    }
    if (!nickname.trim()) {
      setError('Vui lòng nhập tên của bạn!');
      return;
    }
    
    // Move to waiting room
    setError('');
    setPhase('waiting');
    
    // Mock other players joining
    setPlayers([
      { id: '1', name: nickname, isMe: true },
      { id: '2', name: 'Minh Tuấn', isMe: false },
      { id: '3', name: 'Thảo Vy', isMe: false },
      { id: '4', name: 'Bảo Khánh', isMe: false },
    ]);
  };

  const handleStartGame = () => {
    setPhase('playing');
    setCurrentQ(0);
    setScore(0);
    startQuestion(0);
  };

  const startQuestion = (qIndex) => {
    setSelectedAnswer(null);
    setIsAnswerRevealed(false);
    setTimeLeft(MOCK_QUESTIONS[qIndex].time);
  };

  // Timer effect
  useEffect(() => {
    if (phase !== 'playing' || isAnswerRevealed) return;
    
    if (timeLeft <= 0) {
      handleRevealAnswer();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, phase, isAnswerRevealed]);

  const handleSelectAnswer = (idx) => {
    if (isAnswerRevealed) return;
    setSelectedAnswer(idx);
    handleRevealAnswer(idx);
  };

  const handleRevealAnswer = (idx = selectedAnswer) => {
    setIsAnswerRevealed(true);
    if (idx === MOCK_QUESTIONS[currentQ].answer) {
      // Calculate score based on time left (max 1000 pts per question)
      const basePoints = 500;
      const timeBonus = Math.floor((timeLeft / MOCK_QUESTIONS[currentQ].time) * 500);
      setScore(s => s + basePoints + timeBonus);
    }
  };

  const handleNextQuestion = () => {
    if (currentQ < MOCK_QUESTIONS.length - 1) {
      setCurrentQ(q => q + 1);
      startQuestion(currentQ + 1);
    } else {
      setPhase('result');
    }
  };

  const handleQuit = () => {
    setPhase('lobby');
    setRoomCode('');
    setNickname('');
  };


  // --- RENDER PHASES ---

  if (phase === 'lobby') {
    return (
      <div className="w-full min-h-[80vh] flex items-center justify-center p-4 animate-in fade-in duration-500">
        <div className="bg-white rounded-[2rem] p-8 md:p-12 w-full max-w-md shadow-2xl border border-gray-100 text-center relative overflow-hidden">
          
          {/* Decorative shapes */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-100 rounded-full blur-2xl opacity-50"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-100 rounded-full blur-2xl opacity-50"></div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-purple-500/30 mb-6 rotate-12 hover:rotate-0 transition-transform">
              <span className="text-4xl font-black text-white">Q!</span>
            </div>
            
            <h1 className="text-3xl font-black text-gray-900 mb-2">Tham gia Quiz</h1>
            <p className="text-gray-500 font-medium mb-8">Nhập mã phòng từ giáo viên để bắt đầu</p>

            <form onSubmit={handleJoin} className="space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl">{error}</div>}
              
              <div>
                <input 
                  type="text" 
                  placeholder="Mã phòng (VD: 123456)" 
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-100 px-5 py-4 rounded-2xl text-center text-xl font-black tracking-widest outline-none focus:border-purple-500 focus:bg-white transition-all uppercase"
                  maxLength={8}
                />
              </div>
              
              <div>
                <input 
                  type="text" 
                  placeholder="Biệt danh của bạn" 
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-100 px-5 py-4 rounded-2xl text-center text-lg font-bold outline-none focus:border-purple-500 focus:bg-white transition-all"
                  maxLength={15}
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 mt-4 rounded-2xl font-black text-white text-lg tracking-wide transition-all transform hover:-translate-y-1 active:translate-y-0"
                style={{ background: "linear-gradient(135deg, #9333ea, #3b82f6)", boxShadow: "0 10px 25px rgba(147, 51, 234, 0.3)" }}
              >
                VÀO PHÒNG
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'waiting') {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
        <div className="text-center mb-10">
          <p className="text-gray-500 font-black uppercase tracking-[0.3em] mb-2">Đang trong phòng chờ</p>
          <h2 className="text-5xl font-black text-gray-900 drop-shadow-sm tracking-widest">{roomCode.toUpperCase()}</h2>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 w-full max-w-4xl shadow-sm border border-gray-200/50 min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Users size={20} className="text-purple-500" />
              Người chơi ({players.length})
            </h3>
            <div className="flex gap-2">
              <span className="flex h-3 w-3 relative mt-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-bold text-gray-500">Đang chờ chủ phòng...</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {players.map((p, i) => (
              <div 
                key={i} 
                className={`px-5 py-3 rounded-2xl font-bold animate-in zoom-in duration-300 ${p.isMe ? 'bg-purple-100 text-purple-700 border-2 border-purple-200' : 'bg-gray-100 text-gray-700'}`}
              >
                {p.name} {p.isMe && '(Bạn)'}
              </div>
            ))}
          </div>
        </div>

        {/* MOCK HOST BUTTON - Chỉ dùng để test luồng */}
        <button 
          onClick={handleStartGame}
          className="mt-12 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-gray-800 transition-all shadow-xl flex items-center gap-2"
        >
          <Play size={20} /> [TEST] Chủ phòng bắt đầu
        </button>
      </div>
    );
  }

  if (phase === 'playing') {
    const q = MOCK_QUESTIONS[currentQ];

    return (
      <div className="w-full min-h-[85vh] flex flex-col items-center bg-[#f0f4f5] rounded-3xl overflow-hidden shadow-sm border border-gray-200 animate-in fade-in relative">
        
        {/* Header */}
        <div className="w-full bg-white px-6 py-4 flex justify-between items-center border-b border-gray-200">
          <div className="font-black text-gray-400">Câu {currentQ + 1} / {MOCK_QUESTIONS.length}</div>
          <div className="flex items-center gap-4">
             <div className="font-black text-xl text-purple-600">{score.toLocaleString()} <span className="text-sm text-gray-400">PTS</span></div>
             <button onClick={handleQuit} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors">
               <LogOut size={18} />
             </button>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 w-full flex flex-col items-center justify-center p-6 md:p-12 relative">
          
          {/* Timer Circle */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl shadow-lg border-4 ${timeLeft <= 5 ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-white text-gray-800 border-gray-100'}`}>
              {timeLeft}
            </div>
          </div>

          <h2 className="text-2xl md:text-4xl font-black text-center text-gray-900 mt-12 mb-12 max-w-3xl leading-tight">
            {q.question}
          </h2>

          {/* Result Overlay */}
          {isAnswerRevealed && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate-in zoom-in duration-300">
               {selectedAnswer === q.answer ? (
                 <div className="bg-green-500 text-white px-12 py-8 rounded-3xl text-center shadow-2xl shadow-green-500/40 transform -translate-y-8">
                   <CheckCircle2 size={80} className="mx-auto mb-4" />
                   <h2 className="text-3xl font-black">CHÍNH XÁC!</h2>
                   <p className="font-bold opacity-90 mt-2">+ Điểm nhanh tay</p>
                 </div>
               ) : (
                 <div className="bg-red-500 text-white px-12 py-8 rounded-3xl text-center shadow-2xl shadow-red-500/40 transform -translate-y-8">
                   <XCircle size={80} className="mx-auto mb-4" />
                   <h2 className="text-3xl font-black">SAI RỒI!</h2>
                   <p className="font-bold opacity-90 mt-2">Cố gắng ở câu sau nhé</p>
                 </div>
               )}

               <button 
                 onClick={handleNextQuestion}
                 className="mt-8 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-xl"
               >
                 Tiếp tục <ChevronRight size={20} />
               </button>
            </div>
          )}

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mt-auto z-0">
            {q.options.map((opt, i) => {
              const color = COLORS[i];
              let stateClass = '';
              
              if (isAnswerRevealed) {
                if (i === q.answer) stateClass = 'opacity-100 ring-4 ring-green-400 ring-offset-2';
                else if (i === selectedAnswer) stateClass = 'opacity-50 grayscale';
                else stateClass = 'opacity-30';
              }

              return (
                <button
                  key={i}
                  disabled={isAnswerRevealed}
                  onClick={() => handleSelectAnswer(i)}
                  className={`relative overflow-hidden w-full h-24 md:h-32 rounded-[2rem] flex items-center p-6 text-left transition-all duration-200 transform active:scale-95 text-white font-black text-xl md:text-2xl ${color.bg} ${!isAnswerRevealed && color.hover} ${!isAnswerRevealed && 'shadow-[0_8px_0_0] ' + color.shadow} ${stateClass}`}
                  style={{ transform: !isAnswerRevealed ? 'translateY(0)' : i !== q.answer ? 'translateY(8px)' : 'scale(1.02)' , boxShadow: !isAnswerRevealed ? undefined : 'none' }}
                >
                  <span className="text-3xl mr-4 opacity-80">{color.icon}</span>
                  <span className="drop-shadow-sm leading-tight">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-4 animate-in zoom-in duration-500">
        <div className="bg-white rounded-[3rem] p-12 w-full max-w-lg shadow-2xl border border-gray-100 text-center relative overflow-hidden">
           
           <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-500/20 to-transparent"></div>

           <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 mx-auto flex items-center justify-center mb-6 shadow-xl shadow-orange-500/40 relative z-10">
             <Trophy size={40} className="text-white" />
           </div>

           <h2 className="text-4xl font-black text-gray-900 mb-2 relative z-10">KẾT QUẢ</h2>
           <p className="text-gray-500 font-bold mb-8">Bạn chơi rất xuất sắc, {nickname}!</p>

           <div className="bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100">
             <p className="text-sm font-black uppercase tracking-widest text-gray-400 mb-2">Tổng điểm</p>
             <p className="text-5xl font-black text-purple-600">{score.toLocaleString()}</p>
           </div>

           <button 
             onClick={handleQuit}
             className="w-full py-4 rounded-2xl font-black text-white text-lg bg-gray-900 hover:bg-gray-800 transition-all shadow-xl"
           >
             Trở về sảnh
           </button>
        </div>
      </div>
    );
  }

  return null;
}
