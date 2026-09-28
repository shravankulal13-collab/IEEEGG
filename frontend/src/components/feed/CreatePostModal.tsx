import React, { useState, useRef } from 'react';
import { useFeedStore, type FeedPost } from '../../store/feedStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useAuthStore } from '../../store/authStore';
import {
  X,
  Camera,
  Upload,
  Link as LinkIcon,
  MapPin,
  AlertTriangle,
  Flame,
  Car,
  Activity,
  HeartPulse,
  Zap,
  Image as ImageIcon,
  Send,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_SCENES = [
  {
    name: 'Road Collision',
    url: 'https://cf-images.assettype.com/newindianexpress%2F2025-10-12%2Fqwal4hr8%2FWhatsApp-Image-2025-10-12-at-15.11.17.jpeg',
    cat: 'accident',
  },
  {
    name: 'Traffic Congestion',
    url: 'https://akm-img-a-in.tosshub.com/indiatoday/images/story/202207/mumbai_rain_traffic_PTI_1200x768.jpeg?VersionId=zffODVP0pFt5K9n7SJa9YxScvBQ.9NLm',
    cat: 'traffic',
  },
  {
    name: 'Hospital ER / Doctor',
    url: 'https://st5.depositphotos.com/16337376/67848/i/450/depositphotos_678487976-stock-photo-shoulder-shot-friendly-indian-doctor.jpg',
    cat: 'medical',
  },
  {
    name: 'Emergency Green Corridor',
    url: 'https://cf-images.assettype.com/newindianexpress%2F2026-09-18%2Fyzf573px%2F5355b0cc-641c-438e-9b04-d97743f7ba81.jpg?w=480&auto=format%2Ccompress',
    cat: 'corridor',
  },
  {
    name: 'Blood Donation Camp',
    url: 'https://media.istockphoto.com/id/1757613775/photo/close-up-shot-of-hand-of-male-blood-donor-with-an-attached-catheter-black-man-holding-heart.jpg?s=612x612&w=0&k=20&c=IgdTBRdl8knok_-2jH0xczy1BFEfnyS3iXeCx_XvKDg=',
    cat: 'blood_donor',
  },
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const { createPost } = useFeedStore();
  const { user } = useAuthStore();
  const geo = useGeolocation(true);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<FeedPost['category']>('traffic');
  const [location, setLocation] = useState('MG Road, Bengaluru (GPS Pinpoint)');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageMode, setImageMode] = useState<'upload' | 'url' | 'presets'>('upload');
  const [customUrl, setCustomUrl] = useState('');
  const [severity, setSeverity] = useState<FeedPost['severity']>('high');
  const [isSuccessToast, setIsSuccessToast] = useState(false);

  if (!isOpen) return null;

  const handleUseCurrentLocation = () => {
    if (geo.latitude && geo.longitude) {
      setLocation(geo.address || `GPS: ${geo.latitude.toFixed(4)}, ${geo.longitude.toFixed(4)} (Bengaluru)`);
    } else {
      setLocation('Indiranagar 100ft Road, Bengaluru (GPS Live)');
    }
  };

  // Compress & resize image via Canvas to avoid localStorage QuotaExceededError
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setUploadedImage(dataUrl);
        } else {
          setUploadedImage(readerEvent.target?.result as string);
        }
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      setUploadedImage(customUrl.trim());
      setCustomUrl('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    createPost({
      title: title.trim(),
      content: content.trim(),
      category,
      location: location.trim(),
      image: uploadedImage || undefined,
      severity,
      authorName: user?.fullName || 'Citizen Responder',
    });

    setIsSuccessToast(true);
    setTimeout(() => {
      setIsSuccessToast(false);
      onClose();
      setTitle('');
      setContent('');
      setUploadedImage(null);
      setCustomUrl('');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0B1B4F] border border-[#1E3A8A] text-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative my-8">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-red-500" />
            <h3 className="text-sm font-bold text-white">Create Incident or Traffic Post</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Toast */}
        {isSuccessToast && (
          <div className="p-3 bg-emerald-600 text-white font-semibold text-center text-xs flex items-center justify-center gap-1.5">
            <span>Post Published. +2 Stars credited to your profile.</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Category Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'traffic', label: 'Traffic Delay', icon: <Car className="w-3.5 h-3.5 text-amber-400" /> },
                { id: 'accident', label: 'Road Collision', icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> },
                { id: 'medical', label: 'Medical SOS', icon: <HeartPulse className="w-3.5 h-3.5 text-red-500" /> },
                { id: 'corridor', label: 'Green Corridor', icon: <Zap className="w-3.5 h-3.5 text-emerald-400" /> },
                { id: 'blood_donor', label: 'Blood Needed', icon: <Activity className="w-3.5 h-3.5 text-pink-400" /> },
                { id: 'hazard', label: 'Road Hazard', icon: <Flame className="w-3.5 h-3.5 text-orange-400" /> },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as any)}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    category === cat.id
                      ? 'bg-red-600/30 border-red-500 text-white'
                      : 'bg-slate-900/60 border-white/10 text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Collision on Inner Ring Road, right lane blocked"
              className="w-full px-3.5 py-2 bg-slate-900/90 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Details
            </label>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe road conditions, emergency assistance needed, or alternative clear routes..."
              className="w-full px-3.5 py-2 bg-slate-900/90 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>

          {/* Location Pin */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-200">
                Location
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="text-xs font-medium text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
              >
                <MapPin className="w-3 h-3" />
                <span>Use Current Location</span>
              </button>
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Silk Board Junction, Outer Ring Road"
              className="w-full px-3.5 py-2 bg-slate-900/90 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>

          {/* Incident Image Attachment */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                <span>Attach Scene Image (Photo / File / URL)</span>
              </label>
              {!uploadedImage && (
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      imageMode === 'upload' ? 'bg-sky-500/20 text-sky-300 font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      imageMode === 'url' ? 'bg-sky-500/20 text-sky-300 font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('presets')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      imageMode === 'presets' ? 'bg-sky-500/20 text-sky-300 font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Presets
                  </button>
                </div>
              )}
            </div>

            {/* Hidden Native File Inputs */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={cameraInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {!uploadedImage ? (
              <div className="space-y-2">
                {imageMode === 'upload' && (
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-sky-400/50 flex flex-col items-center justify-center gap-1.5 text-xs text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      <Camera className="w-5 h-5 text-sky-400" />
                      <span className="font-semibold">Take Photo</span>
                      <span className="text-[10px] text-slate-400">Capture with Camera</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-emerald-400/50 flex flex-col items-center justify-center gap-1.5 text-xs text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      <Upload className="w-5 h-5 text-emerald-400" />
                      <span className="font-semibold">Upload Image File</span>
                      <span className="text-[10px] text-slate-400">Choose from Files / Photos</span>
                    </button>
                  </div>
                )}

                {imageMode === 'url' && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="Paste image URL (https://...)"
                      className="flex-1 px-3 py-2 bg-slate-900/90 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400"
                    />
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      disabled={!customUrl.trim()}
                      className="px-3 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Set Image</span>
                    </button>
                  </div>
                )}

                {imageMode === 'presets' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRESET_SCENES.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setUploadedImage(preset.url)}
                        className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-sky-400 flex flex-col items-start gap-1 text-left transition cursor-pointer group"
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-14 object-cover rounded-lg group-hover:scale-[1.02] transition"
                        />
                        <span className="text-[10px] font-medium text-slate-300 group-hover:text-white truncate w-full">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-white/20 bg-black max-h-48 group">
                <img
                  src={uploadedImage}
                  alt="Incident Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-44 object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedImage(null);
                      setImageMode('upload');
                    }}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold backdrop-blur-md cursor-pointer"
                  >
                    Change Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadedImage(null)}
                    className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 backdrop-blur-md cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/75 px-2 py-0.5 rounded text-[10px] text-emerald-300 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Image Attached</span>
                </div>
              </div>
            )}
          </div>

          {/* Severity & Submit */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Severity:</span>
              {(['critical', 'high', 'medium'] as const).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverity(sev)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize transition cursor-pointer ${
                    severity === sev
                      ? sev === 'critical'
                        ? 'bg-red-500 text-white'
                        : sev === 'high'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-sky-500 text-white'
                      : 'bg-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-semibold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Share Post</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
