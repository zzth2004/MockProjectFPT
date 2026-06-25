import React, { useState } from 'react';
import { Trophy, Flame, Star, Medal, ChevronUp, ChevronDown, User, Zap } from 'lucide-react';

// MOCK DATA: Leaderboard based on STREAK
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
  // Current user mock (Rank 12)
  { id: 99, name: 'Bạn (Current User)', avatar: 'https://i.pravatar.cc/150?u=99', streak: 25, exp: 4200, trend: 'up', isCurrentUser: true },
].sort((a, b) => b.streak - a.streak); // Sort descending by streak

const PODIUM_COLORS = {
  1: { bg: 'from-yellow-400 to-yellow-600', text: 'text-yellow-600', shadow: 'shadow-yellow-500/40', border: 'border-yellow-400', badge: '🥇' },
  2: { bg: 'from-gray-300 to-gray-500', text: 'text-gray-600', shadow: 'shadow-gray-500/30', border: 'border-gray-300', badge: '🥈' },
  3: { bg: 'from-orange-400 to-orange-700', text: 'text-orange-700', shadow: 'shadow-orange-700/30', border: 'border-orange-500', badge: '🥉' },
};

function TopThreePodium({ data }) {
  // Reorder for visual podium: Rank 2, Rank 1, Rank 3
  const podiumOrder = [data[1], data[0], data[2]];

  return (
    <div className="flex justify-center items-end gap-2 md:gap-6 pt-10 pb-8 px-4">
      {podiumOrder.map((user, index) => {
        if (!user) return null;
        const rank = data.indexOf(user) + 1;
        const style = PODIUM_COLORS[rank];
        const isFirst = rank === 1;

        return (
          <div key={user.id} className={`flex flex-col items-center relative ${isFirst ? 'z-10 -translate-y-4' : 'z-0'}`}>
            {/* Crown for #1 */}
            {isFirst && (
              <div className="absolute -top-10 animate-bounce">
                <Trophy size={32} className="text-yellow-500 drop-shadow-md" />
              </div>
            )}

            {/* Avatar */}
            <div className={`relative rounded-full p-1 bg-gradient-to-br ${style.bg} shadow-lg ${style.shadow} mb-4`}>
              <img src={user.avatar} alt={user.name} className={`rounded-full border-4 border-white bg-white object-cover ${isFirst ? 'w-24 h-24' : 'w-16 h-16 md:w-20 md:h-20'}`} />
              <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white rounded-full px-2 py-0.5 text-xs font-black border-2 ${style.border} ${style.text}`}>
                #{rank}
              </div>
            </div>

            {/* Info */}
            <p className={`font-bold text-gray-800 text-center truncate w-24 md:w-32 ${isFirst ? 'text-lg' : 'text-sm'}`}>{user.name}</p>
            <div className="flex items-center justify-center gap-1 mt-1 bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
              <Flame size={isFirst ? 16 : 14} className="text-orange-500" />
              <span className={`font-black text-orange-600 ${isFirst ? 'text-sm' : 'text-xs'}`}>{user.streak}</span>
            </div>
            
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

function LeaderboardRow({ user, rank }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md border ${user.isCurrentUser ? 'bg-orange-50/80 border-orange-200 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
      
      {/* Rank Indicator */}
      <div className="w-8 flex justify-center items-center">
        <span className="text-lg font-black text-gray-400">#{rank}</span>
      </div>

      {/* Avatar */}
      <img src={user.avatar} alt={user.name} className={`w-12 h-12 rounded-full object-cover ${user.isCurrentUser ? 'border-2 border-orange-400' : 'border border-gray-200'}`} />

      {/* Name & Trend */}
      <div className="flex-1 min-w-0">
        <p className={`font-bold truncate ${user.isCurrentUser ? 'text-orange-700' : 'text-gray-800'}`}>
          {user.name}
          {user.isCurrentUser && <span className="ml-2 text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Bạn</span>}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-medium text-gray-500">{user.exp.toLocaleString()} EXP</span>
          {user.trend === 'up' && <ChevronUp size={14} className="text-green-500" />}
          {user.trend === 'down' && <ChevronDown size={14} className="text-red-500" />}
          {user.trend === 'same' && <div className="w-3 h-0.5 bg-gray-300 rounded" />}
        </div>
      </div>

      {/* Streak Score */}
      <div className="flex items-center justify-center gap-1.5 bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 min-w-[80px]">
        <Flame size={18} className="text-orange-500" />
        <span className="font-black text-orange-600 text-lg">{user.streak}</span>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState('all_time'); // 'weekly' | 'monthly' | 'all_time'

  const topThree = MOCK_LEADERBOARD.slice(0, 3);
  const remaining = MOCK_LEADERBOARD.slice(3);

  return (
    <div className="w-full pb-12 font-sans animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Flame size={200} className="text-orange-500 rotate-12" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Flame size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Streak Leaderboard</h1>
              <p className="text-gray-500 font-medium mt-1 text-sm md:text-base">Đua top chuỗi ngày học liên tiếp. Ai kiên trì nhất?</p>
            </div>
          </div>

          {/* Timeframe Filter */}
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
        </div>
      </div>

      {/* Podium Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 mb-8 pt-4 overflow-hidden">
        <h2 className="text-center font-black uppercase tracking-widest text-gray-400 text-sm mt-4">Top 3 Kiên Trì Nhất</h2>
        <TopThreePodium data={topThree} />
      </div>

      {/* Remaining List Section */}
      <div className="space-y-3">
        {remaining.map((user, index) => (
          <LeaderboardRow key={user.id} user={user} rank={index + 4} />
        ))}
      </div>

      {/* Current User Fixed Bottom Bar (Optional if user is not in top visible) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] md:w-[600px] bg-gray-900 rounded-2xl p-4 shadow-2xl border border-gray-700 flex items-center justify-between z-40 backdrop-blur-md bg-opacity-95">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-black text-white border-2 border-gray-900">
               #{MOCK_LEADERBOARD.findIndex(u => u.isCurrentUser) + 1}
            </div>
            <div>
              <p className="text-white font-bold text-sm">Vị trí của bạn</p>
              <p className="text-gray-400 text-xs font-medium">Cần thêm 5 ngày để thăng hạng!</p>
            </div>
         </div>
         <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-700">
            <Flame size={16} className="text-orange-500" />
            <span className="text-white font-black">{MOCK_LEADERBOARD.find(u => u.isCurrentUser)?.streak || 0}</span>
         </div>
      </div>

    </div>
  );
}
