import React, { useEffect, useState } from 'react';
import { Camera, Clock3, Heart, MapPin, ThumbsDown, ThumbsUp, Upload, X, ShieldAlert, FileText } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { publicService, type PublicFeedItem, type PublicIncidentReport, type PublicPostType, type PublicReportCategory } from '../services/public.service';

const statusVariant: Record<PublicIncidentReport['status'], 'warning' | 'success' | 'info' | 'danger'> = {
  pending: 'warning',
  verified: 'success',
  dispatched: 'info',
  disputed: 'danger',
};

const formatLocation = (report: PublicIncidentReport) =>
  report.latitude !== undefined && report.longitude !== undefined
    ? `${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`
    : 'Location pending';

export const PublicReports: React.FC = () => {
  const [reports, setReports] = useState<PublicFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [category, setCategory] = useState<PublicReportCategory>('accident');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [postType, setPostType] = useState<PublicPostType>('emergency');
  const [title, setTitle] = useState('');

  const loadReports = async () => {
    try {
      const nextReports = await publicService.list();
      setReports(nextReports);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Unable to load public incident reports.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    const channel = publicService.subscribe(loadReports);
    const poll = channel ? undefined : window.setInterval(loadReports, 15000);
    return () => {
      if (poll) window.clearInterval(poll);
      void publicService.unsubscribe(channel);
    };
  }, []);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setError('Location capture is not available in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => setError('Location permission was not granted.'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleImage = (file: File | undefined) => {
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const submitReport = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!image || (postType === 'emergency' && !location) || (postType === 'health' && !title.trim())) {
      setError(postType === 'health' ? 'Add an image and title first.' : 'Add an image and capture the incident location first.');
      return;
    }
    setIsSubmitting(true);
    try {
      const report = await publicService.create({
        image,
        postType,
        category: postType === 'emergency' ? category : undefined,
        title: postType === 'health' ? title : undefined,
        ...(postType === 'emergency' && location ? location : { latitude: 0, longitude: 0 }),
        ...(postType === 'emergency' && location ? location : {}),
        description,
      });
      setReports((current) => [report, ...current]);
      setIsFormOpen(false);
      setImage(null);
      setImagePreview(null);
      setDescription('');
      setTitle('');
      setLocation(null);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Unable to submit this report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reactToReport = async (reportId: string, reaction: 'confirm' | 'dispute') => {
    try {
      const updated = await publicService.react(reportId, reaction);
      setReports((current) => current.map((report) => (report.id === updated.id ? updated : report)));
    } catch (err: any) {
      setError(err.message || 'Unable to record your reaction.');
    }
  };

  const likeHealthPost = async (postId: string) => {
    try {
      const updated = await publicService.likeHealthPost(postId);
      setReports((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err: any) {
      setError(err.message || 'Unable to like this health post.');
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-12 max-w-7xl mx-auto">
        <PageHeader
          title="Public Incident Reports"
          subtitle="Share a visible emergency and help nearby responders verify what is happening in real time."
          actions={
            <Button onClick={() => setIsFormOpen(true)} variant="danger" className="btn-pulse-glow">
              <Camera className="mr-2 h-4 w-4" />
              Report Incident
            </Button>
          }
        />

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/60 px-4 py-3 text-xs font-semibold text-red-200">
            {error}
          </div>
        )}

        {isFormOpen && (
          <div className="rounded-2xl border border-[#1E3A8A] bg-[#0B1B4F] p-6 text-white shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">New Public Post</h2>
                <p className="text-xs text-slate-300">Share an emergency signal or useful community health information.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                aria-label="Close report form"
                className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-4 flex gap-2 rounded-xl bg-slate-900/80 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setPostType('emergency')}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition ${postType === 'emergency' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Emergency Signal
              </button>
              <button
                type="button"
                onClick={() => setPostType('health')}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition ${postType === 'health' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Health Advisory
              </button>
            </div>
            <form onSubmit={submitReport} className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  Incident photo
                  <input
                    className="mt-1 block w-full rounded-xl border border-white/15 bg-slate-900/80 p-2 text-xs text-white"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(event) => handleImage(event.target.files?.[0])}
                    required
                  />
                </label>
                {imagePreview && (
                  <img src={imagePreview} alt="Selected incident" className="h-44 w-full rounded-xl object-cover border border-white/15" />
                )}
                {postType === 'health' ? (
                  <label className="block text-xs font-bold text-slate-300">
                    Title
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      maxLength={160}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-slate-900/80 p-2.5 text-xs text-white placeholder:text-slate-500"
                      placeholder="Blood donation camp this Saturday"
                      required
                    />
                  </label>
                ) : (
                  <label className="block text-xs font-bold text-slate-300">
                    Category
                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value as PublicReportCategory)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-slate-900/80 p-2.5 text-xs text-white"
                    >
                      <option value="accident" className="bg-slate-900 text-white">Accident</option>
                      <option value="fire" className="bg-slate-900 text-white">Fire</option>
                      <option value="medical" className="bg-slate-900 text-white">Medical emergency</option>
                      <option value="other" className="bg-slate-900 text-white">Other</option>
                    </select>
                  </label>
                )}
              </div>
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  Description
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={4}
                    maxLength={postType === 'health' ? 2000 : 1000}
                    className="mt-1 w-full rounded-xl border border-white/15 bg-slate-900/80 p-2.5 text-xs text-white placeholder:text-slate-500"
                    placeholder={postType === 'health' ? 'Share useful details for the community.' : 'What can responders see?'}
                    required={postType === 'health'}
                  />
                </label>
                {postType === 'emergency' && (
                  <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3 text-xs text-slate-300">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <MapPin className="h-4 w-4 text-red-500" />
                      Report location
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : 'No location captured yet.'}
                    </p>
                    <Button type="button" variant="outline" size="sm" className="mt-2.5 border-white/20 text-slate-200 hover:bg-white/10" onClick={captureLocation}>
                      <MapPin className="mr-1.5 h-3.5 w-3.5" />
                      Use current GPS location
                    </Button>
                  </div>
                )}
                <Button type="submit" fullWidth isLoading={isSubmitting} disabled={!image || (postType === 'emergency' ? !location : !title.trim())} className="bg-red-600 hover:bg-red-700 text-white font-extrabold shadow-lg shadow-red-600/30">
                  <Upload className="mr-2 h-4 w-4" />
                  Publish {postType === 'health' ? 'Health Post' : 'Incident Report'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl border border-[#1E3A8A] bg-[#0B1B4F] p-8 text-center text-slate-300">
            <p className="text-xs font-semibold">Loading community reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl border border-[#1E3A8A] bg-[#0B1B4F] p-12 text-center text-slate-300 shadow-xl">
            <FileText className="w-10 h-10 mx-auto mb-3 text-slate-400" />
            <h3 className="text-sm font-bold text-white mb-1">No Public Reports Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">Share an emergency signal or useful community health update to notify responders.</p>
            <Button onClick={() => setIsFormOpen(true)} variant="danger" size="sm">
              <Camera className="mr-1.5 h-3.5 w-3.5" />
              Create First Report
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reports.map((item) =>
              item.post_type === 'health' ? (
                <div key={item.id} className="overflow-hidden rounded-2xl border border-[#1E3A8A] bg-[#0B1B4F] shadow-xl text-white">
                  <img src={item.image_url} alt={item.title} className="h-48 w-full bg-slate-900 object-cover" />
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="info">Health Advisory</Badge>
                        <h2 className="mt-2 text-sm font-black text-white">{item.title}</h2>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                    <p className="text-[11px] text-slate-400">By community member · {new Date(item.created_at).toLocaleString()}</p>
                    <Button size="sm" variant={item.user_reaction === 'like' ? 'primary' : 'outline'} onClick={() => likeHealthPost(item.id)} className="border-white/20 text-slate-200 hover:bg-white/10">
                      <Heart className="mr-1.5 h-3.5 w-3.5" />
                      Like {item.like_count}
                    </Button>
                  </div>
                </div>
              ) : (
                <div key={item.id} className="overflow-hidden rounded-2xl border border-[#1E3A8A] bg-[#0B1B4F] shadow-xl text-white">
                  <img src={item.image_url} alt={`${item.category} incident report`} className="h-48 w-full bg-slate-900 object-cover" />
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="danger">Emergency Signal</Badge>
                        <p className="mt-2 text-sm font-black capitalize text-white">{item.category} Report</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-300 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-red-400" />
                          {formatLocation(item)}
                        </p>
                      </div>
                      <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
                    </div>
                    {item.description && <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>}
                    <p className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock3 className="h-3.5 w-3.5" />
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 border-t border-white/10 pt-3">
                      <Button size="sm" variant={item.user_reaction === 'confirm' ? 'primary' : 'outline'} onClick={() => reactToReport(item.id, 'confirm')} className="border-white/20 text-slate-200 hover:bg-white/10">
                        <ThumbsUp className="mr-1.5 h-3.5 w-3.5" />
                        Confirm {item.confirm_votes}
                      </Button>
                      <Button size="sm" variant={item.user_reaction === 'dispute' ? 'danger' : 'outline'} onClick={() => reactToReport(item.id, 'dispute')} className="border-white/20 text-slate-200 hover:bg-white/10">
                        <ThumbsDown className="mr-1.5 h-3.5 w-3.5" />
                        Dispute {item.dispute_votes}
                      </Button>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-400">
                      Trust score: {Math.round(item.trust_score * 100)}% ({item.total_votes} votes)
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default PublicReports;
