// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet / SK
// MODULE: Instagram-Style Stories Carousel for Live Incident Alerts & Heroes
// ============================================================

import React from 'react';
import { Plus } from 'lucide-react';

interface StoryItem {
  id: string;
  name: string;
  avatar: string;
  isAddStory?: boolean;
  isLiveAlert?: boolean;
  hasUnseenStory?: boolean;
  category?: string;
}

interface StoriesBarProps {
  onAddPost: () => void;
  onOpenLeaderboard: () => void;
  onSelectCategory: (cat: string) => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  onAddPost,
  onOpenLeaderboard,
  onSelectCategory,
}) => {
  const stories: StoryItem[] = [
    {
      id: 'add-story',
      name: 'Your Story',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      isAddStory: true,
    },
    {
      id: 's-corridor',
      name: 'Green Corridor',
      avatar: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=200&q=80',
      isLiveAlert: true,
      category: 'corridor',
    },
    {
      id: 's-dr-priya',
      name: 'Dr. Priya',
      avatar: 'https://images.unsplash.com/photo-1594824813598-a28a30e8c891?auto=format&fit=crop&w=200&q=80',
      hasUnseenStory: true,
      category: 'life_saved',
    },
    {
      id: 's-silkboard',
      name: 'Hosur Road',
      avatar: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=200&q=80',
      isLiveAlert: true,
      category: 'accident',
    },
    {
      id: 's-ananya',
      name: 'Paramedic ALS',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      hasUnseenStory: true,
      category: 'medical',
    },
    {
      id: 's-traffic',
      name: 'Sony World',
      avatar: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=200&q=80',
      hasUnseenStory: true,
      category: 'traffic',
    },
    {
      id: 's-hall-of-fame',
      name: 'Top Heroes',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      hasUnseenStory: true,
    },
  ];

  const handleStoryClick = (story: StoryItem) => {
    if (story.isAddStory) {
      onAddPost();
    } else if (story.id === 's-hall-of-fame') {
      onOpenLeaderboard();
    } else if (story.category) {
      onSelectCategory(story.category);
    }
  };

  return (
    <div className="bg-[#0B1B4F]/90 backdrop-blur-md rounded-2xl border border-[#1E3A8A] p-3 shadow-xl overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-4 min-w-max px-1">
        {stories.map((story) => (
          <div
            key={story.id}
            onClick={() => handleStoryClick(story)}
            className="flex flex-col items-center gap-1.5 cursor-pointer group transition-transform active:scale-95 select-none"
          >
            {/* Story Ring */}
            <div className="relative">
              <div
                className={`w-14 h-14 rounded-full p-[2px] flex items-center justify-center transition-all ${
                  story.isAddStory
                    ? 'border-2 border-dashed border-sky-400'
                    : story.isLiveAlert
                    ? 'bg-gradient-to-tr from-red-600 via-rose-500 to-amber-400'
                    : 'bg-gradient-to-tr from-amber-400 via-red-500 to-purple-600'
                }`}
              >
                <div className="w-full h-full rounded-full bg-[#0B1B4F] p-[2px] overflow-hidden">
                  <img
                    src={story.avatar}
                    alt={story.name}
                    className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Add Badge */}
              {story.isAddStory && (
                <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold shadow border-2 border-[#0B1B4F]">
                  <Plus className="w-3 h-3" />
                </div>
              )}
            </div>

            {/* Clean Story Label */}
            <span className="text-[11px] font-medium text-slate-300 group-hover:text-white max-w-[70px] truncate text-center">
              {story.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoriesBar;
