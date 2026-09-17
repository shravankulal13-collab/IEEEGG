import React, { useEffect, useState } from 'react';
import { Camera, Clock3, Heart, MapPin, ThumbsDown, ThumbsUp, Upload, X } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { publicService, type PublicFeedItem, type PublicIncidentReport, type PublicPostType, type PublicReportCategory } from '../services/public.service';

const statusVariant: Record<PublicIncidentReport['status'], 'warning' | 'success' | 'info' | 'danger'> = {
  pending: 'warning',
  verified: 'success',
  dispatched: 'info',
  disputed: 'danger',
};

const formatLocation = (report: PublicIncidentReport) => `${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`;

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
      <div className="space-y-6 pb-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-red-600">Community signal network</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Public incident reports</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Share a visible emergency and help nearby responders verify what is happening.</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}><Camera className="mr-2 h-4 w-4" />Report incident</Button>
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

        {isFormOpen && (
          <Card className="border-blue-200 bg-blue-50/40">
            <div className="mb-4 flex items-center justify-between">
              <div><h2 className="text-lg font-black text-slate-900">New public post</h2><p className="text-xs text-slate-500">Share an emergency signal or useful community health information.</p></div>
              <button type="button" onClick={() => setIsFormOpen(false)} aria-label="Close report form" className="rounded-lg p-2 text-slate-500 hover:bg-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="mb-4 flex gap-2 rounded-lg bg-white p-1 border border-slate-200">
              <button type="button" onClick={() => setPostType('emergency')} className={`flex-1 rounded-md px-3 py-2 text-sm font-bold ${postType === 'emergency' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Emergency</button>
              <button type="button" onClick={() => setPostType('health')} className={`flex-1 rounded-md px-3 py-2 text-sm font-bold ${postType === 'health' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Health Post</button>
            </div>
            <form onSubmit={submitReport} className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">Incident photo<input className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm" type="file" accept="image/*" capture="environment" onChange={(event) => handleImage(event.target.files?.[0])} required /></label>
                {imagePreview && <img src={imagePreview} alt="Selected incident" className="h-44 w-full rounded-lg object-cover" />}
                {postType === 'health' ? <label className="block text-xs font-bold text-slate-700">Title<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm" placeholder="Blood donation camp this Saturday" required /></label> : <label className="block text-xs font-bold text-slate-700">Category<select value={category} onChange={(event) => setCategory(event.target.value as PublicReportCategory)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm"><option value="accident">Accident</option><option value="fire">Fire</option><option value="medical">Medical emergency</option><option value="other">Other</option></select></label>}
              </div>
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} maxLength={postType === 'health' ? 2000 : 1000} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm" placeholder={postType === 'health' ? 'Share useful details for the community.' : 'What can responders see?'} required={postType === 'health'} /></label>
                {postType === 'emergency' && <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600"><div className="flex items-center gap-2 font-bold text-slate-800"><MapPin className="h-4 w-4 text-red-600" />Report location</div><p className="mt-1 text-xs">{location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : 'No location captured yet.'}</p><Button type="button" variant="outline" size="sm" className="mt-3" onClick={captureLocation}><MapPin className="mr-2 h-4 w-4" />Use current location</Button></div>}
                <Button type="submit" fullWidth isLoading={isSubmitting} disabled={!image || (postType === 'emergency' ? !location : !title.trim())}><Upload className="mr-2 h-4 w-4" />Publish {postType === 'health' ? 'health post' : 'report'}</Button>
              </div>
            </form>
          </Card>
        )}

        {isLoading ? <Card><p className="text-sm text-slate-500">Loading community reports...</p></Card> : reports.length === 0 ? <Card><p className="text-sm text-slate-500">No public posts yet. Share an emergency signal or health update.</p></Card> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{reports.map((item) => item.post_type === 'health' ? <Card key={item.id} className="overflow-hidden p-0"><img src={item.image_url} alt={item.title} className="h-48 w-full bg-slate-100 object-cover" /><div className="space-y-3 p-4"><div className="flex items-start justify-between gap-2"><div><Badge variant="info">Health Post</Badge><h2 className="mt-2 text-sm font-black text-slate-900">{item.title}</h2></div></div><p className="text-sm text-slate-600">{item.description}</p><p className="text-xs text-slate-400">By community member · {new Date(item.created_at).toLocaleString()}</p><Button size="sm" variant={item.user_reaction === 'like' ? 'primary' : 'outline'} onClick={() => likeHealthPost(item.id)}><Heart className="mr-1.5 h-3.5 w-3.5" />Like {item.like_count}</Button></div></Card> : <Card key={item.id} className="overflow-hidden p-0"><img src={item.image_url} alt={`${item.category} incident report`} className="h-48 w-full bg-slate-100 object-cover" /><div className="space-y-3 p-4"><div className="flex items-start justify-between gap-2"><div><Badge variant="danger">Emergency</Badge><p className="mt-2 text-sm font-black capitalize text-slate-900">{item.category} report</p><p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" />{formatLocation(item)}</p></div><Badge variant={statusVariant[item.status]}>{item.status}</Badge></div>{item.description && <p className="text-sm text-slate-600">{item.description}</p>}<p className="flex items-center gap-1 text-xs text-slate-400"><Clock3 className="h-3.5 w-3.5" />{new Date(item.created_at).toLocaleString()}</p><div className="flex items-center gap-2 border-t border-slate-100 pt-3"><Button size="sm" variant={item.user_reaction === 'confirm' ? 'primary' : 'outline'} onClick={() => reactToReport(item.id, 'confirm')}><ThumbsUp className="mr-1.5 h-3.5 w-3.5" />Confirm {item.confirm_votes}</Button><Button size="sm" variant={item.user_reaction === 'dispute' ? 'danger' : 'outline'} onClick={() => reactToReport(item.id, 'dispute')}><ThumbsDown className="mr-1.5 h-3.5 w-3.5" />Dispute {item.dispute_votes}</Button></div><p className="text-xs font-semibold text-slate-500">Trust score: {Math.round(item.trust_score * 100)}% ({item.total_votes} votes)</p></div></Card>)}</div>}
      </div>
    </AppShell>
  );
};
