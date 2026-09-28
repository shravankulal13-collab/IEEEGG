import React, { useState } from 'react';
import { useFeedStore, type FeedPost } from '../../store/feedStore';
import { useAuthStore } from '../../store/authStore';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Star,
  ShieldCheck,
  Award,
  ChevronLeft,
  ChevronRight,
  Smile,
  MapPin,
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
  const [isSaved, setIsSaved] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText.trim(), user?.fullName || 'Citizen Responder');
    setCommentText('');
    setShowComments(true);
  };

  const getCategoryBadge = () => {
    switch (post.category) {
      case 'accident':
        return { label: 'Accident Alert', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      case 'traffic':
        return { label: 'Traffic Congestion', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'medical':
        return { label: 'Medical SOS', color: 'bg-red-500/20 text-red-300 border-red-500/30' };
      case 'corridor':
        return { label: 'Green Corridor', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'blood_donor':
        return { label: 'Blood Needed', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' };
      case 'life_saved':
        return { label: 'Life Saved', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      default:
        return { label: 'Emergency Alert', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
    }
  };

  const catBadge = getCategoryBadge();

  return (
    <article className="w-full max-w-[500px] mx-auto bg-[#0B1B4F]/85 backdrop-blur-md rounded-2xl border border-[#1E3A8A] text-white overflow-hidden shadow-xl select-none transition">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between p-3.5 sm:p-4">
        <div className="flex items-center gap-3">
          {/* Avatar with Story Gradient Ring */}
          <div className="w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-400 via-red-500 to-purple-600 shrink-0">
            <div className="w-full h-full rounded-full bg-[#0B1B4F] p-[1.5px] overflow-hidden">
              <img
                src={post.authorAvatar || 'https://www.shutterstock.com/image-photo/young-indian-male-project-leader-260nw-2598795897.jpg'}
                alt={post.authorName}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://www.shutterstock.com/image-photo/young-indian-male-project-leader-260nw-2598795897.jpg';
                }}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="text-xs sm:text-sm font-bold text-white hover:underline cursor-pointer">
                {post.authorName}
              </span>
              {post.isVerifiedReporter && (
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" title="Verified First Responder" />
              )}
              <span className="text-[10px] font-mono text-amber-300 font-semibold bg-amber-500/15 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                <span>{post.authorStars}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300 mt-1 font-normal">
              <MapPin className="w-3 h-3 text-red-400 shrink-0" />
              <span className="truncate max-w-[200px]">{post.location}</span>
              <span>•</span>
              <span className="text-slate-400 shrink-0">{post.timestamp}</span>
            </div>
          </div>
        </div>

        {/* Category Pill */}
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${catBadge.color}`}>
          {catBadge.label}
        </span>
      </div>

      {/* 2. Photo Hero Container */}
      {post.image && (
        <div
          className="relative w-full bg-slate-950 overflow-hidden flex items-center justify-center group"
          onDoubleClick={() => likePost(post.id)}
        >
          <img
            src={post.image}
            alt={post.title}
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80';
            }}
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

      {/* 3. Action Bar */}
      <div className="p-3.5 sm:p-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          {/* Left: Like, Comment, Share */}
          <div className="flex items-center gap-4">
            <button
              type="button"
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
              type="button"
              onClick={() => setShowComments(!showComments)}
              className="text-slate-200 hover:text-white transition cursor-pointer"
              title="Comment"
            >
              <MessageCircle className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="text-slate-200 hover:text-white transition cursor-pointer"
              title="Share Incident"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Right: Karma Star & Save */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => awardStar(post.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                post.isStarAwardedByMe
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-white/10 hover:bg-white/15 text-amber-300 border border-amber-500/30'
              }`}
              title="Award Star for accurate emergency intel"
            >
              <Star className={`w-3.5 h-3.5 ${post.isStarAwardedByMe ? 'fill-slate-950' : 'fill-amber-300'}`} />
              <span>{post.starsAwarded}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSaved(!isSaved)}
              className="text-slate-200 hover:text-white transition cursor-pointer"
              title="Save Post"
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Likes Count */}
        <div className="text-xs font-semibold text-slate-200 mb-1">
          <span>{post.likesCount} {post.likesCount === 1 ? 'like' : 'likes'}</span>
          <span className="mx-1.5 text-slate-500">•</span>
          <span className="text-amber-300">{post.starsAwarded} Stars</span>
          {post.lifeSavedCount > 0 && (
            <>
              <span className="mx-1.5 text-slate-500">•</span>
              <span className="text-emerald-300">{post.lifeSavedCount} lives saved</span>
            </>
          )}
        </div>

        {/* Caption */}
        <div className="text-xs text-slate-200 leading-relaxed font-normal">
          <span className="font-bold text-white mr-1.5 hover:underline cursor-pointer">
            {post.authorName}
          </span>
          <strong className="text-white font-semibold">{post.title}</strong>
          <span className="mx-1 text-slate-400">—</span>
          <span>
            {isExpanded ? post.content : `${post.content.slice(0, 110)}...`}
          </span>
          {post.content.length > 110 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-white font-semibold text-xs ml-1 cursor-pointer"
            >
              {isExpanded ? 'less' : 'more'}
            </button>
          )}
        </div>

        {/* Comments Link */}
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="text-xs text-slate-400 hover:text-slate-300 font-medium mt-1.5 block cursor-pointer"
        >
          {post.comments.length === 0
            ? 'Add comment...'
            : `View all ${post.comments.length} comments`}
        </button>

        {shareToast && (
          <p className="text-[11px] text-sky-300 font-medium mt-1">
            Link copied to clipboard
          </p>
        )}
      </div>

      {/* 4. Comments Accordion */}
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

          {/* Inline Comment Input */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1 border-t border-white/5">
            <Smile className="w-4 h-4 text-slate-400 shrink-0 cursor-pointer hover:text-white" />
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment or on-ground update..."
              className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none py-1 font-normal"
            />
            {commentText.trim() && (
              <button
                type="submit"
                className="text-xs font-bold text-sky-400 hover:text-sky-300 cursor-pointer"
              >
                Post
              </button>
            )}
          </form>
        </div>
      )}
    </article>
  );
};

export default FeedCard;
