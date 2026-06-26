import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Star, Medal, ChevronUp, ChevronDown, User, Zap, Loader2 } from 'lucide-react';
import gamificationService from '../../../AdminControl/Service/API/gamificationAPI/gamification.service';
import { useAuth } from '../../../context/authContext';

const PODIUM_COLORS = {
  1: { bg: 'from-amber-400 via-yellow-500 to-amber-600', text: 'text-amber-600', shadow: 'shadow-yellow-500/40', border: 'border-amber-400', badge: '🥇' },
  2: { bg: 'from-slate-300 via-gray-400 to-slate-500', text: 'text-slate-600', shadow: 'shadow-slate-500/30', border: 'border-slate-300', badge: '🥈' },
  3: { bg: 'from-amber-600 via-orange-500 to-amber-800', text: 'text-amber-800', shadow: 'shadow-orange-700/30', border: 'border-amber-700', badge: '🥉' },
};

function TopThreePodium({ data }) {
  // Reorder for visual podium: Rank 2, Rank 1, Rank 3
  const podiumOrder = [data[1], data[0], data[2]];

  return (
    <div className="flex justify-center items-end gap-2 md:gap-8 pt-26 pb-8 px-4">
      {podiumOrder.map((user, index) => {
        if (!user) return null;
        const rank = data.indexOf(user) + 1;
        const style = PODIUM_COLORS[rank];
        const isFirst = rank === 1;

        return (
          <div key={user.id} className={`flex flex-col items-center relative ${isFirst ? 'z-10 -translate-y-4 scale-105' : 'z-0'}`}>
            {/* Crown for #1 */}
            {isFirst && (
              <div className="absolute -top-12 animate-bounce duration-1000">
                <Trophy size={36} className="text-yellow-500 drop-shadow-[0_4px_6px_rgba(250,204,21,0.4)]" fill="#fbbf24" />
              </div>
            )}

            {/* Avatar */}
            <div className={`relative rounded-full p-1 bg-gradient-to-br ${style.bg} shadow-lg ${style.shadow} mb-4`}>
              <img 
                src={user.avatar} 
                alt={user.name} 
                className={`rounded-full border-4 border-white bg-white object-cover ${isFirst ? 'w-24 h-24 font-bold' : 'w-16 h-16 md:w-20 md:h-20 font-bold'}`}
                onError={(e) => {
                  e.target.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.id}`;
                }}
              />
              <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white rounded-full px-2.5 py-0.5 text-xs font-black border-2 ${style.border} ${style.text}`}>
                #{rank}
              </div>
            </div>

            {/* Info */}
            <p className={`font-black text-gray-800 text-center truncate w-24 md:w-32 ${isFirst ? 'text-base' : 'text-sm'}`}>{user.name}</p>
            
            {/* Level & EXP Info */}
            <div className="flex flex-col items-center gap-1 mt-2">
              <span className="text-[10px] font-extrabold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Lv.{user.level}</span>
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                <Zap size={13} className="text-amber-500" fill="#f59e0b" />
                <span className="font-extrabold text-amber-700 text-xs">{user.exp.toLocaleString()} EXP</span>
              </div>
            </div>
            
            {/* Podium Base */}
            <div className={`w-20 md:w-28 mt-4 rounded-t-2xl bg-gradient-to-b ${style.bg} ${style.shadow} flex flex-col justify-between p-3`} 
                 style={{ height: isFirst ? '140px' : rank === 2 ? '95px' : '75px' }}>
              <div className="w-full flex justify-center opacity-25">
                <span className="text-white font-black text-3xl md:text-4xl">{rank}</span>
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
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${user.isCurrentUser ? 'bg-green-50/50 border-green-300' : 'bg-white border-gray-200/60 hover:bg-gray-50/50'}`} style={{ boxShadow: 'none' }}>
      
      {/* Rank Indicator */}
      <div className="w-8 flex justify-center items-center">
        <span className="text-sm font-black text-gray-400">#{rank}</span>
      </div>

      {/* Avatar */}
      <img 
        src={user.avatar} 
        alt={user.name} 
        className={`w-12 h-12 rounded-full object-cover bg-gray-50 ${user.isCurrentUser ? 'border-2 border-green-500' : 'border border-gray-200'}`}
        onError={(e) => {
          e.target.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.id}`;
        }}
      />

      {/* Name & Level */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`font-extrabold truncate text-sm md:text-base ${user.isCurrentUser ? 'text-green-800' : 'text-gray-800'}`}>
            {user.name}
          </p>
          {user.isCurrentUser && (
            <span className="text-[9px] font-black bg-[#377437] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
              Bạn
            </span>
          )}
          <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
            Lv.{user.level}
          </span>
        </div>
        <p className="text-xs text-gray-400 font-medium mt-0.5">Học viên tích cực</p>
      </div>

      {/* Score */}
      <div className="flex items-center gap-1.5 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-100 min-w-[90px] justify-center">
        <Zap size={16} className="text-amber-500" fill="#f59e0b" />
        <span className="font-black text-amber-700 text-sm md:text-base">{user.exp.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('all_time'); // UI-only tabs
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboardAndStats();
  }, []);

  const fetchLeaderboardAndStats = async () => {
    try {
      setLoading(true);
      const [leaderboardRes, statsRes] = await Promise.all([
        gamificationService.getLeaderboard(20),
        gamificationService.getMyStats().catch(err => {
          console.error("Lỗi lấy stats cá nhân:", err);
          return null;
        })
      ]);

      // Map data từ Backend (UserPoint DTO lồng user)
      const mapped = leaderboardRes.map(item => ({
        id: item.userId,
        name: item.user?.fullName || item.user?.username || "Học viên",
        avatar: item.user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${item.userId}`,
        level: item.currentLevel || 1,
        exp: item.totalPoints || 0,
        isCurrentUser: Number(user?.id) === Number(item.userId)
      }));

      setLeaderboardData(mapped);
      if (statsRes) {
        setMyStats(statsRes);
      }
    } catch (error) {
      console.error("Lỗi lấy Bảng xếp hạng:", error);
    } finally {
      setLoading(false);
    }
  };

  const topThree = leaderboardData.slice(0, 3);
  const remaining = leaderboardData.slice(3);

  // Tìm vị trí của user hiện tại
  const myRank = leaderboardData.findIndex(u => u.isCurrentUser) !== -1 
    ? leaderboardData.findIndex(u => u.isCurrentUser) + 1 
    : null;

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 text-[#377437] animate-spin mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Đang tải bảng xếp hạng...</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-24 font-sans animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header section */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200/80 mb-8 relative overflow-hidden" style={{ boxShadow: 'none' }}>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Trophy size={200} className="text-[#377437] rotate-12" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#377437] to-emerald-600 flex items-center justify-center">
              <Trophy size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Bảng Xếp Hạng EXP</h1>
              <p className="text-gray-500 font-bold mt-1 text-xs md:text-sm">Tích lũy điểm số từ các bài học, bài tập để đua Top học tập!</p>
            </div>
          </div>

          {/* Timeframe Filter (UI only for layout completeness) */}
          <div className="flex bg-gray-100 p-1 rounded-xl w-fit border border-gray-200/50">
            {[
              { id: 'weekly', label: 'Tuần' },
              { id: 'monthly', label: 'Tháng' },
              { id: 'all_time', label: 'Tất cả' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTimeframe(tab.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  timeframe === tab.id 
                  ? 'bg-white text-[#377437] border border-gray-200/30' 
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
      <div className="bg-white rounded-2xl border border-gray-200/80 mb-8 pt-6 overflow-hidden" style={{ boxShadow: 'none' }}>
        <h2 className="text-center font-black uppercase tracking-widest text-gray-400 text-xs">Top 3 Học Viên Tích Cực</h2>
        <TopThreePodium data={topThree} />
      </div>

      {/* Remaining List Section */}
      <div className="space-y-3 mb-10">
        {remaining.map((u, index) => (
          <LeaderboardRow key={u.id} user={u} rank={index + 4} />
        ))}
      </div>

      {/* Current User Fixed Bottom Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] md:w-[600px] bg-gray-900/95 backdrop-blur-md rounded-2xl p-4 border border-gray-800 flex items-center justify-between z-40" style={{ boxShadow: 'none' }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black text-base">
             #{myRank || '-'}
          </div>
          <div>
            <p className="text-white font-black text-sm">Thứ hạng của bạn</p>
            <div className="flex items-center gap-3 text-gray-400 text-xs mt-0.5">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Zap size={12} fill="#f59e0b" className="text-amber-400" />
                {myStats?.totalPoints?.toLocaleString() || 0} EXP
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-700" />
              <span className="flex items-center gap-1 text-orange-400 font-bold">
                <Flame size={12} fill="#f97316" className="text-orange-400" />
                Chuỗi {myStats?.currentStreak || 0} ngày
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Cấp độ</span>
          <span className="text-white font-black text-sm bg-gray-800 px-3 py-1 rounded-lg border border-gray-700 mt-1 inline-block">
            Lv.{myStats?.currentLevel || 1}
          </span>
        </div>
      </div>
    </div>
  );
}
