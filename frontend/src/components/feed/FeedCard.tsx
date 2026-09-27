// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet / SK
// MODULE: Ultra-Clean Instagram Style Feed Card Component
// SYSTEM: ResQGrid Life-Saver Karma & Community Intel
// ============================================================

import React, { useState } from 'react';
import { useFeedStore, type FeedPost } from '../../store/feedStore';
import { useAuthStore } from '../../store/authStore';
import {
  Heart,
  MessageCircle,
  Share2,
  Star,
  MapPin,
  ShieldCheck,
  Award,
} from 'lucide-react';

interface FeedCardProps {
  post: FeedPost;
}

export const FeedCard: React.FC<FeedCardProps> = ({ post }) => {
  const { likePost, awardStar, confirmLifeSaved, addComment } = useFeedStore();
  const { user } = useAuthStore();

  const [showComments, setShowComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [shareToast, setShareToast] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const getCategoryLabel = () => {
    switch (post.category) {
      case 'accident':
        return 'Accident Response';
      case 'traffic':
        return 'Traffic Delay';
      case 'medical':
        return 'Medical SOS';
      case 'corridor':
        return 'Green Corridor';
      case 'blood_donor':
        return 'Blood Needed';
      case 'life_saved':
        return 'Life Saved';
      default:
        return 'Community Alert';
    }
  };

  const getCategoryColor = () => {
    switch (post.category) {
      case 'accident':
        return 'text-rose-300 bg-rose-500/10 border-rose-500/20';
      case 'traffic':
        return 'text-amber-300 bg-amber-500/10 border-amber-500/20';
      case 'medical':
        return 'text-red-300 bg-red-500/10 border-red-500/20';
      case 'corridor':
        return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20';
      case 'blood_donor':
        return 'text-pink-300 bg-pink-500/10 border-pink-500/20';
      case 'life_saved':
        return 'text-amber-300 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-sky-300 bg-sky-500/10 border-sky-500/20';
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  };

  const handleConfirmLifeSaved = () => {
    confirmLifeSaved(post.id);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText.trim(), user?.fullName || 'Citizen Responder');
    setCommentText('');
  };

  return (
    <div className="bg-[#0B1B4F]/95 backdrop-blur-md rounded-2xl border border-[#1E3A8A] text-white overflow-hidden shadow-xl transition-all">
      
      {/* 1. Instagram Post Header */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-400 via-red-500 to-purple-600 shrink-0">
            <img
              src={post.authorAvatar}
              alt={post.authorName}
              className="w-full h-full rounded-full object-cover border border-[#0B1B4F]"
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-white leading-none">
                {post.authorName}
              </span>
              {post.isVerifiedReporter && (
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              )}
              <span className="text-[10px] font-mono text-amber-300 font-semibold bg-amber-500/15 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                <span>{post.authorStars}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300 mt-1 font-normal">
              <MapPin className="w-3 h-3 text-red-400 shrink-0" />
              <span className="truncate max-w-[170px] sm:max-w-[240px]">{post.location}</span>
              <span>•</span>
              <span className="text-slate-400 shrink-0">{post.timestamp}</span>
            </div>
          </div>
        </div>

        {/* Category Pill on Top Right */}
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getCategoryColor()}`}>
          {getCategoryLabel()}
        </span>
      </div>

      {/* 2. Photo Hero (Instagram Full-Bleed Media) */}
      {post.image && (
        <div
          className="relative bg-slate-950 w-full overflow-hidden select-none cursor-pointer group"
          onDoubleClick={() => likePost(post.id)}
        >
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-64 sm:h-80 object-cover transition-transform duration-500 group-hover:scale-[1.01]"
          />

          {/* Life Saved Badge */}
          {post.isLifeSaved && (
            <div className="absolute top-3 left-3 bg-amber-950/90 backdrop-blur-md border border-amber-500/40 rounded-full px-2.5 py-1 flex items-center gap-1 text-[10px] font-bold text-amber-300 shadow-md">
              <Award className="w-3 h-3 text-amber-300" />
              <span>Life Saved Verified</span>
            </div>
          )}

          {/* Status Chip */}
          <div className="absolute top-3 right-3">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/70 backdrop-blur-md text-white border border-white/20">
              {post.status.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* 3. Instagram Action Bar */}
      <div className="p-3.5 sm:p-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          {/* Left: Like, Comment, Share */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => likePost(post.id)}
              className="text-white hover:opacity-80 transition transform active:scale-125 cursor-pointer"
              title="Like"
            >
              <Heart
                className={`w-5 h-5 ${
                  post.isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-200'
                }`}
              />
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="text-slate-200 hover:text-white transition transform active:scale-110 cursor-pointer"
              title="Comment"
            >
              <MessageCircle className="w-5 h-5" />
            </button>

            <button
              onClick={handleShare}
              className="text-slate-200 hover:text-white transition transform active:scale-110 cursor-pointer"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Right: Award Star / Life Saver Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => awardStar(post.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                post.isStarAwardedByMe
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-white/10 hover:bg-white/15 text-amber-300 border border-amber-500/30'
              }`}
              title="Award Star for accurate intel"
            >
              <Star className={`w-3.5 h-3.5 ${post.isStarAwardedByMe ? 'fill-slate-950' : 'fill-amber-300'}`} />
              <span>{post.starsAwarded}</span>
            </button>

            <button
              onClick={handleConfirmLifeSaved}
              className="px-2.5 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-[11px] font-semibold text-emerald-300 transition cursor-pointer"
              title="Confirm life saved (+5 Stars)"
            >
              +5 Stars Saved
            </button>
          </div>
        </div>

        {/* Likes and Stars Count */}
        <div className="text-xs font-semibold text-slate-200 mb-1.5">
          <span>{post.likesCount} likes</span>
          <span className="mx-1.5 text-slate-500">•</span>
          <span className="text-amber-300">{post.starsAwarded} Stars awarded</span>
          {post.lifeSavedCount > 0 && (
            <>
              <span className="mx-1.5 text-slate-500">•</span>
              <span className="text-emerald-300">{post.lifeSavedCount} lives saved</span>
            </>
          )}
        </div>

        {/* 4. Instagram Caption */}
        <div className="text-xs text-slate-200 leading-relaxed font-normal">
          <span className="font-bold text-white mr-1.5">{post.authorName}</span>
          <strong className="text-white font-semibold">{post.title}</strong>
          <span className="mx-1 text-slate-400">—</span>
          <span>
            {isExpanded ? post.content : `${post.content.slice(0, 110)}...`}
          </span>
          {post.content.length > 110 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-white font-semibold text-xs ml-1 cursor-pointer"
            >
              {isExpanded ? 'less' : 'more'}
            </button>
          )}
        </div>

        {/* View Comments Link */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-xs text-slate-400 hover:text-slate-300 font-medium mt-1.5 block cursor-pointer"
        >
          {post.comments.length === 0
            ? 'Add comment...'
            : `View all ${post.comments.length} comments`}
        </button>

        {/* Toast alerts */}
        {shareToast && (
          <div className="text-[11px] text-sky-300 font-medium mt-1">
            Link copied to clipboard
          </div>
        )}
        {savedToast && (
          <div className="text-[11px] text-amber-300 font-semibold mt-1">
            Life Saved confirmed. +5 Stars awarded to {post.authorName}.
          </div>
        )}
      </div>

      {/* 5. Instagram Comments Accordion & Inline Input */}
      {showComments && (
        <div className="px-4 pb-3 pt-1 border-t border-white/10 bg-slate-900/40 space-y-2">
          {post.comments.length > 0 && (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {post.comments.map((c) => (
                <div key={c.id} className="text-xs flex items-start gap-1.5 font-normal">
                  <span className="font-bold text-white shrink-0">{c.authorName}:</span>
                  <span className="text-slate-300">{c.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Clean 1-Line Comment Input */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1 border-t border-white/5">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment or on-ground update..."
              className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none py-1 font-normal"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 disabled:opacity-40 cursor-pointer"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FeedCard;
