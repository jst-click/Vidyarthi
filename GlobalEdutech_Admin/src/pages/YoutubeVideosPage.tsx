import React, { useEffect, useState } from 'react';
import ApiService from '../services/apiService';

type YTVideo = {
  _id: string;
  title: string;
  description?: string;
  youtube_url: string;
  thumbnail_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

const YouTubeVideosPage: React.FC = () => {
  const [videos, setVideos] = useState<YTVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form, setForm] = useState<{ title: string; youtube_url: string; description: string }>({ title: '', youtube_url: '', description: '' });

  const getYouTubeId = (rawUrl: string): string | null => {
    try {
      const url = new URL(rawUrl);
      // Short link: https://youtu.be/VIDEO_ID
      if (url.hostname.includes('youtu.be')) {
        return url.pathname.replace('/', '').split('?')[0];
      }
      // Standard watch: https://www.youtube.com/watch?v=VIDEO_ID
      const v = url.searchParams.get('v');
      if (v) return v;
      // Embed: https://www.youtube.com/embed/VIDEO_ID
      const pathParts = url.pathname.split('/').filter(Boolean);
      const embedIndex = pathParts.indexOf('embed');
      if (embedIndex >= 0 && pathParts[embedIndex + 1]) return pathParts[embedIndex + 1];
      // Shorts: https://www.youtube.com/shorts/VIDEO_ID
      const shortsIndex = pathParts.indexOf('shorts');
      if (shortsIndex >= 0 && pathParts[shortsIndex + 1]) return pathParts[shortsIndex + 1];
      // Live: https://www.youtube.com/live/VIDEO_ID
      const liveIndex = pathParts.indexOf('live');
      if (liveIndex >= 0 && pathParts[liveIndex + 1]) return pathParts[liveIndex + 1];
      // Fallback regex (very lenient)
      const match = rawUrl.match(/[\/?&]v=([a-zA-Z0-9_-]{6,})/) || rawUrl.match(/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{6,})/);
      return match ? match[1] : null;
    } catch {
      const match = rawUrl.match(/[\/?&]v=([a-zA-Z0-9_-]{6,})/) || rawUrl.match(/(?:youtu\.be\/|embed\/|shorts\/|live\/)([a-zA-Z0-9_-]{6,})/);
      return match ? match[1] : null;
    }
  };

  const getThumbnailUrl = (url: string): string | null => {
    const id = getYouTubeId(url);
    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
  };

  const getWatchUrl = (url: string): string => {
    const id = getYouTubeId(url);
    return id ? `https://www.youtube.com/watch?v=${id}` : url;
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getYouTubeVideos();
      setVideos(res.videos || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!form.title || !form.youtube_url) return;
    const token = 'admin-token';
    await ApiService.createYouTubeVideo({ title: form.title, youtube_url: form.youtube_url, description: form.description }, token);
    setForm({ title: '', youtube_url: '', description: '' });
    load();
  };

  const remove = async (id: string) => {
    const token = 'admin-token';
    await ApiService.deleteYouTubeVideo(id, token);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <h2 className="text-2xl font-bold mb-4">Add YouTube Video</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="border rounded-lg px-4 py-2" />
          <input value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} placeholder="YouTube URL" className="border rounded-lg px-4 py-2" />
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)" className="border rounded-lg px-4 py-2" />
        </div>
        <button onClick={create} className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg">Save</button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow">
        <h2 className="text-xl font-bold mb-4">Videos</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((v) => (
              <div key={v._id} className="border rounded-xl overflow-hidden shadow-sm">
                <a href={getWatchUrl(v.youtube_url)} target="_blank" rel="noopener noreferrer" className="block">
                  <div className="aspect-video bg-black flex items-center justify-center">
                    {getThumbnailUrl(v.youtube_url) ? (
                      <img src={getThumbnailUrl(v.youtube_url) as string} alt={v.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-white text-sm">Open on YouTube</div>
                    )}
                  </div>
                </a>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{v.title}</div>
                    {v.description ? <div className="text-sm text-gray-600">{v.description}</div> : null}
                  </div>
                  <button onClick={() => remove(v._id)} className="text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeVideosPage;


