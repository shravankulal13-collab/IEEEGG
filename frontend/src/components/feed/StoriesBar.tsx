import React, { useRef } from 'react';
import { ChevronRight, Plus } from 'lucide-react';

interface StoryItem {
  id: string;
  name: string;
  avatar: string;
  category?: string;
  isAddStory?: boolean;
}

interface StoriesBarProps {
  onAddPost: () => void;
  onOpenLeaderboard: () => void;
  onSelectCategory: (cat: string) => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  onAddPost,
  onSelectCategory,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const stories: StoryItem[] = [
    {
      id: 'add-story',
      name: 'Your Post',
      avatar: 'https://www.shutterstock.com/image-photo/portrait-confident-young-indian-business-260nw-2695542473.jpg',
      isAddStory: true,
    },
    {
      id: 's-dr-priya',
      name: 'Dr. Priya',
      avatar: 'https://media.istockphoto.com/id/519361223/photo/young-indian-woman.jpg?s=170667a&w=0&k=20&c=Z5yzzlD7kVqP7UhIe8Qb7VGQoXBbNS4NoQMIHBzjWGI=',
      category: 'life_saved',
    },
    {
      id: 's-ananya',
      name: 'Ananya ALS',
      avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbboQP6Mp1TVio-h8t9177WFi6MUbgeIrRQ7qqtAfshSkYoOqb5MCGtSk8&s=10',
      category: 'medical',
    },
    {
      id: 's-silkboard',
      name: 'Hosur Alert',
      avatar: 'https://cf-images.assettype.com/newindianexpress%2F2025-10-12%2Fqwal4hr8%2FWhatsApp-Image-2025-10-12-at-15.11.17.jpeg',
      category: 'accident',
    },
    {
      id: 's-corridor',
      name: 'MG Corridor',
      avatar: 'https://cf-images.assettype.com/newindianexpress%2F2026-09-18%2Fyzf573px%2F5355b0cc-641c-438e-9b04-d97743f7ba81.jpg?w=480&auto=format%2Ccompress',
      category: 'corridor',
    },
    {
      id: 's-traffic',
      name: 'Sony World',
      avatar: 'https://akm-img-a-in.tosshub.com/indiatoday/images/story/202207/mumbai_rain_traffic_PTI_1200x768.jpeg?VersionId=zffODVP0pFt5K9n7SJa9YxScvBQ.9NLm',
      category: 'traffic',
    },
    {
      id: 's-meera',
      name: 'Meera (Blood)',
      avatar: 'https://img.magnific.com/free-photo/indian-woman-posing-cute-stylish-outfit-camera-smiling_482257-122351.jpg',
      category: 'blood_donor',
    },
    {
      id: 's-rajesh',
      name: 'Rajesh K',
      avatar: 'https://www.shutterstock.com/image-photo/young-indian-male-project-leader-260nw-2598795897.jpg',
      category: 'accident',
    },
  ];

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full max-w-[500px] mx-auto py-2 select-none">
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-3.5 overflow-x-auto no-scrollbar scroll-smooth px-1"
      >
        {stories.map((story) => (
          <div
            key={story.id}
            onClick={() => {
              if (story.isAddStory) {
                onAddPost();
              } else if (story.category) {
                onSelectCategory(story.category);
              }
            }}
            className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group"
          >
            {/* Story Ring */}
            <div className="relative">
              <div
                className={`w-16 h-16 rounded-full p-[2px] flex items-center justify-center transition-transform group-hover:scale-[1.03] ${
                  story.isAddStory
                    ? 'border-2 border-dashed border-sky-400'
                    : 'bg-gradient-to-tr from-amber-500 via-red-500 to-purple-600'
                }`}
              >
                <div className="w-full h-full rounded-full bg-slate-950 p-[2px] overflow-hidden">
                  <img
                    src={story.avatar}
                    alt={story.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>

              {/* Add Story Plus Icon */}
              {story.isAddStory && (
                <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold shadow border border-slate-950">
                  <Plus className="w-3 h-3" />
                </div>
              )}
            </div>

            {/* Username / Name */}
            <span className="text-[11px] font-medium text-slate-300 group-hover:text-white max-w-[68px] truncate text-center">
              {story.name}
            </span>
          </div>
        ))}
      </div>

      {/* Right Scroll Arrow */}
      <button
        type="button"
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-800/90 text-white shadow-lg border border-white/10 flex items-center justify-center cursor-pointer hover:bg-slate-700 transition z-10"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default StoriesBar;
