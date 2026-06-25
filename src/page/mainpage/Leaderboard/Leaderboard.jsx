import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Star, Medal, ChevronUp, ChevronDown, User, Zap, Loader2 } from 'lucide-react';
import gameRoomHistoryService from '../../../AdminControl/Service/API/gameRoomHistoryAPI/game-room-history.service';
import { useAuth } from '../../../context/authContext';

// MOCK DATA: Leaderboard based on STREAK (fallback/default)
const MOCK_LEADERBOARD = [
  { id: 1, name: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?u=1', streak: 145, exp: 25400, trend: 'up' },
  { id: 2, name: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?u=2', streak: 132, exp: 22100, trend: 'same' },
  { id: 3, name: 'Lê Minh C', avatar: 'https://i.pravatar.cc/150?u=3', streak: 120, exp: 19800, trend: 'up' },
  { id: 4, name: 'Phạm D', avatar: 'https://i.pravatar.cc/150?u=4', streak: 98, exp: 15400, trend: 'down' },
  { id: 5, name: 'Hoàng E', avatar: 'https://i.pravatar.cc/150?u=5', streak: 85, exp: 14200, trend: 'up' },
  { id: 6, name: 'Vũ F', avatar: 'https://i.pravatar.cc/150?u=6', streak: 72, exp: 11000, trend: 'same' },
  { id: 7, name: 'Đặng G', avatar: 'https://i.pravatar.cc/150?u=7', streak: 60, exp: 9500, trend: 'down' },
  { id: 8, name: 'Bùi H', avatar: 'https://i.pravatar.cc/150?u=8', streak: 55, exp: 8900, trend: 'up' },
  { id: 9, name: 'Đỗ I', avatar: 'https://i.pravatar.cc/150?u=9', streak: 42, exp: 7200, trend: 'down' },
  { id: 10, name: 'Ngô K', avatar: 'https://i.pravatar.cc/150?u=10', streak: 30, exp: 5100, trend: 'same' },
].sort((a, b) => b.streak - a.streak);

const PODIUM_COLORS = {
  1: { bg: 'from-yellow-400 to-yellow-600', text: 'text-yellow-600', shadow: 'shadow-yellow-500/40', border: 'border-yellow-400', badge: '🥇' },
  2: { bg: 'from-gray-300 to-gray-500', text: 'text-gray-600', shadow: 'shadow-gray-500/30', border: 'border-gray-300', badge: '🥈' },
  3: { bg: 'from-orange-400 to-orange-700', text: 'text-orange-700', shadow: 'shadow-orange-700/30', border: 'border-orange-500', badge: '🥉' },
};

const getAvatar = (user) => {
  return user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.fullName || 'Học viên')}&background=0f172a&color=fff&bold=true&size=150`;
};

function TopThreePodium({ data, isQuizType = false }) {
  // Visual order: Rank 2 (left), Rank 1 (center), Rank 3 (right)
  const podiumOrder = [data[1], data[0], data[2]];

  return (
    <div className="flex justify-center items-end gap-2 md:gap-6 pt-10 pb-8 px-4">
      {podiumOrder.map((user, index) => {
        if (!user) return null;
        const rank = data.indexOf(user) + 1;
        const style = PODIUM_COLORS[rank];
        const isFirst = rank === 1;

        const name = user.name || user.fullName;
        const scoreVal = isQuizType ? user.winCount : user.streak;

        return (
          <div key={user.id || user.userId} className={`flex flex-col items-center relative ${isFirst ? 'z-10 -translate-y-4' : 'z-0'}`}>
            {/* Crown for #1 */}
            {isFirst && (
              <div className="absolute -top-10 animate-bounce">
                <Trophy size={32} className="text-yellow-500 drop-shadow-md" />
              </div>
            )}

            {/* Avatar */}
            <div className={`relative rounded-full p-1 bg-gradient-to-br ${style.bg} shadow-lg ${style.shadow} mb-4`}>
              <img 
                src={getAvatar(user)} 
                alt={name} 
                className={`rounded-full border-4 border-white bg-white object-cover ${isFirst ? 'w-24 h-24' : 'w-16 h-16 md:w-20 md:h-20'}`} 
              />
              <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white rounded-full px-2 py-0.5 text-xs font-black border-2 ${style.border} ${style.text}`}>
                #{rank}
              </div>
            </div>

            {/* Info */}
            <p className={`font-bold text-gray-800 text-center truncate w-24 md:w-32 ${isFirst ? 'text-lg' : 'text-sm'}`}>{name}</p>
            
            {isQuizType ? (
              <div className="flex items-center justify-center gap-1 mt-1 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
                <Trophy size={isFirst ? 16 : 14} className="text-purple-600" />
                <span className={`font-black text-purple-700 ${isFirst ? 'text-sm' : 'text-xs'}`}>{scoreVal} trận thắng</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1 mt-1 bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
                <Flame size={isFirst ? 16 : 14} className="text-orange-500" />
                <span className={`font-black text-orange-600 ${isFirst ? 'text-sm' : 'text-xs'}`}>{scoreVal} ngày</span>
              </div>
            )}
            
            {/* Podium Base */}
            <div className={`w-20 md:w-28 mt-4 rounded-t-xl bg-gradient-to-b ${style.bg} ${style.shadow}`} 
                 style={{ height: isFirst ? '120px' : rank === 2 ? '80px' : '60px' }}>
              <div className="w-full h-full flex items-center justify-center opacity-30">
                <span className="text-white font-black text-4xl">{rank}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LeaderboardRow({ user, rank, isQuizType = false, currentUserId }) {
  const isMe = user.isCurrentUser || (user.userId && user.userId === currentUserId);
  const name = user.name || user.fullName;
  const scoreVal = isQuizType ? user.winCount : user.streak;

  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md border ${
      isMe ? 'bg-orange-50/80 border-orange-200 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'
    }`}>
      
      {/* Rank Indicator */}
      <div className="w-8 flex justify-center items-center">
        <span className="text-lg font-black text-gray-400">#{rank}</span>
      </div>

      {/* Avatar */}
      <img 
        src={getAvatar(user)} 
        alt={name} 
        className={`w-12 h-12 rounded-full object-cover ${isMe ? 'border-2 border-orange-400' : 'border border-gray-200'}`} 
      />

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className={`font-bold truncate ${isMe ? 'text-orange-700' : 'text-gray-800'}`}>
          {name}
          {isMe && <span className="ml-2 text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Bạn</span>}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {isQuizType ? (
            <span className="text-xs font-medium text-gray-500">{user.email}</span>
          ) : (
            <span className="text-xs font-medium text-gray-500">{(user.exp || 0).toLocaleString()} EXP</span>
          )}
          {!isQuizType && user.trend === 'up' && <ChevronUp size={14} className="text-green-500" />}
          {!isQuizType && user.trend === 'down' && <ChevronDown size={14} className="text-red-500" />}
          {!isQuizType && user.trend === 'same' && <div className="w-3 h-0.5 bg-gray-300 rounded" />}
        </div>
      </div>

      {/* Score */}
      {isQuizType ? (
        <div className="flex items-center justify-center gap-1.5 bg-purple-50 px-4 py-2 rounded-xl border border-purple-100 min-w-[110px]">
          <Trophy size={18} className="text-purple-600" />
          <span className="font-black text-purple-700 text-base">{scoreVal} Wins</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-1.5 bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 min-w-[80px]">
          <Flame size={18} className="text-orange-500" />
          <span className="font-black text-orange-600 text-lg">{scoreVal}</span>
        </div>
      )}
    </div>
  );
}

export default function LeaderboardPage() {
  const { user: currentUser } = useAuth();
  const [boardType, setBoardType] = useState('streak'); // 'streak' | 'quiz'
  const [timeframe, setTimeframe] = useState('all_time'); // Only for streak: 'weekly' | 'monthly' | 'all_time'

  // Quiz states
  const [quizWinners, setQuizWinners] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  useEffect(() => {
    if (boardType === 'quiz') {
      setLoadingQuiz(true);
      gameRoomHistoryService.getGlobalWinners(1, 100)
        .then(data => {
          setQuizWinners(data || []);
        })
        .catch(err => {
          console.error("Error loading quiz winners:", err);
        })
        .finally(() => {
          setLoadingQuiz(false);
        });
    }
  }, [boardType]);

  // Streak data setup
  const topThreeStreak = MOCK_LEADERBOARD.slice(0, 3);
  const remainingStreak = MOCK_LEADERBOARD.slice(3);
  const myStreakIndex = MOCK_LEADERBOARD.findIndex(u => u.isCurrentUser);

  // Quiz data setup
  const topThreeQuiz = quizWinners.slice(0, 3);
  const remainingQuiz = quizWinners.slice(3);
  const myQuizIndex = quizWinners.findIndex(w => w.userId === currentUser?.id);

  return (
    <div className="w-full pb-12 font-sans animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          {boardType === 'quiz' ? (
            <Trophy size={200} className="text-purple-500 rotate-12" />
          ) : (
            <Flame size={200} className="text-orange-500 rotate-12" />
          )}
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
              boardType === 'quiz' 
                ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/30' 
                : 'bg-gradient-to-br from-orange-400 to-red-500 shadow-orange-500/30'
            }`}>
              {boardType === 'quiz' ? (
                <Trophy size={32} className="text-white" />
              ) : (
                <Flame size={32} className="text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                {boardType === 'quiz' ? 'Bảng Xếp Hạng Cao Thủ Quiz' : 'Streak Học Tập'}
              </h1>
              <p className="text-gray-500 font-medium mt-1 text-sm md:text-base">
                {boardType === 'quiz' 
                  ? 'Binh đoàn chiến thần có số trận thắng đứng đầu trong phòng Quiz Room.' 
                  : 'Đua top chuỗi ngày học liên tiếp. Ai kiên trì nhất?'}
              </p>
            </div>
          </div>

          {/* Timeframe Filter (Only for streak) */}
          {boardType === 'streak' && (
            <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
              {[
                { id: 'weekly', label: 'Tuần' },
                { id: 'monthly', label: 'Tháng' },
                { id: 'all_time', label: 'Tất cả' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setTimeframe(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    timeframe === tab.id 
                      ? 'bg-white text-orange-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard Type Toggle */}
      <div className="flex border-b border-gray-100 mb-8">
        <button
          onClick={() => setBoardType('streak')}
          className={`pb-4 px-6 font-bold text-sm tracking-wide border-b-2 transition-all ${
            boardType === 'streak'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          🔥 Streak Kiên Trì
        </button>
        <button
          onClick={() => setBoardType('quiz')}
          className={`pb-4 px-6 font-bold text-sm tracking-wide border-b-2 transition-all ${
            boardType === 'quiz'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          🏆 Cao Thủ Quiz Room
        </button>
      </div>

      {boardType === 'quiz' && loadingQuiz ? (
        <div className="w-full py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Đang tải bảng xếp hạng...</p>
        </div>
      ) : boardType === 'quiz' && quizWinners.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <Trophy size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700">Chưa có dữ liệu thi đấu</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
            Hãy rủ bạn bè vào phòng học chung và bắt đầu thi đấu Quiz để có thành tích xuất hiện ở đây!
          </p>
        </div>
      ) : (
        <>
          {/* Podium Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 mb-8 pt-4 overflow-hidden">
            <h2 className="text-center font-black uppercase tracking-widest text-gray-400 text-sm mt-4">
              {boardType === 'quiz' ? 'Top 3 Cao Thủ Vô Địch' : 'Top 3 Kiên Trì Nhất'}
            </h2>
            <TopThreePodium 
              data={boardType === 'quiz' ? topThreeQuiz : topThreeStreak} 
              isQuizType={boardType === 'quiz'} 
            />
          </div>

          {/* Remaining List Section */}
          <div className="space-y-3">
            {(boardType === 'quiz' ? remainingQuiz : remainingStreak).map((user, index) => (
              <LeaderboardRow 
                key={user.id || user.userId} 
                user={user} 
                rank={index + 4} 
                isQuizType={boardType === 'quiz'}
                currentUserId={currentUser?.id}
              />
            ))}
          </div>

          {/* Current User Fixed Bottom Bar (Visible if user is logged in) */}
          {boardType === 'streak' && myStreakIndex >= 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] md:w-[600px] bg-gray-900 rounded-2xl p-4 shadow-2xl border border-gray-700 flex items-center justify-between z-40 backdrop-blur-md bg-opacity-95">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-black text-white border-2 border-gray-900">
                  #{myStreakIndex + 1}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Vị trí của bạn</p>
                  <p className="text-gray-400 text-xs font-medium">Cần thêm 5 ngày để thăng hạng!</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-700">
                <Flame size={16} className="text-orange-500" />
                <span className="text-white font-black">{MOCK_LEADERBOARD[myStreakIndex]?.streak || 0}</span>
              </div>
            </div>
          )}

          {boardType === 'quiz' && myQuizIndex >= 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] md:w-[600px] bg-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-700 flex items-center justify-between z-40 backdrop-blur-md bg-opacity-95">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-black text-white border-2 border-slate-900">
                  #{myQuizIndex + 1}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Vị trí của bạn</p>
                  <p className="text-gray-400 text-xs font-medium">Chiến đấu thêm 1 trận thắng để vươn lên!</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                <Trophy size={16} className="text-purple-400" />
                <span className="text-white font-black">{quizWinners[myQuizIndex]?.winCount || 0} Wins</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
