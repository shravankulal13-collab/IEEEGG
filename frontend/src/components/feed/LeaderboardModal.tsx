// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet / SK
// MODULE: Citizen Life Saver Leaderboard & Star Karma Modal
// ============================================================

import React from 'react';
import { useFeedStore } from '../../store/feedStore';
import { Trophy, Star, ShieldCheck, X, Award } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const { getLeaderboard, userStats } = useFeedStore();
  const leaderboard = getLeaderboard();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0B1B4F] border border-[#1E3A8A] text-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative my-8">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">Community First Responders</h3>
              <p className="text-xs text-slate-300">Top ranked reporters by verified intel and lives saved</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current User Stats Card */}
        <div className="p-4 bg-slate-900/60 border-b border-white/10">
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#102B7B]/60 border border-sky-400/20">
            <div>
              <span className="text-[10px] font-semibold text-sky-300 uppercase tracking-wide block">YOUR REPUTATION</span>
              <h4 className="text-sm font-bold text-white">{userStats.rank}</h4>
              <p className="text-[11px] text-slate-300 mt-0.5">Bengaluru Metropolitan Zone</p>
            </div>
            <div className="flex items-center gap-4 text-center">
              <div>
                <span className="text-lg font-bold text-amber-300 font-mono flex items-center justify-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  {userStats.stars}
                </span>
                <span className="text-[10px] text-slate-400 block">Stars</span>
              </div>
              <div className="border-l border-white/15 pl-4">
                <span className="text-lg font-bold text-rose-400 font-mono">{userStats.livesSaved}</span>
                <span className="text-[10px] text-slate-400 block">Lives Saved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table List */}
        <div className="p-4 space-y-2.5 max-h-[50vh] overflow-y-auto">
          {leaderboard.map((user, idx) => (
            <div
              key={user.id}
              className="p-3 rounded-xl bg-slate-900/60 border border-white/10 hover:border-amber-400/30 transition flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    idx === 0
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : idx === 1
                      ? 'bg-slate-300 text-slate-950'
                      : idx === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {idx + 1}
                </div>

                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-white/20 shrink-0"
                />

                <div>
                  <div className="flex items-center gap-1">
                    <h5 className="text-xs font-bold text-white">{user.name}</h5>
                    <ShieldCheck className="w-3 h-3 text-sky-400" />
                  </div>
                  <span className="text-[10px] text-slate-400">{user.role}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <span className="text-xs font-bold text-amber-300 block font-mono flex items-center justify-end gap-0.5">
                    <Star className="w-3 h-3 fill-amber-300" />
                    {user.stars}
                  </span>
                  <span className="text-[10px] text-slate-400">Stars</span>
                </div>
                <div className="border-l border-white/10 pl-3">
                  <span className="text-xs font-bold text-rose-400 block font-mono">{user.livesSaved}</span>
                  <span className="text-[10px] text-slate-400">Saved</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 text-center text-xs text-slate-400 border-t border-white/10 font-normal">
          Stars are awarded by community members and medical dispatchers for verified alerts and life-saving reporting.
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;
