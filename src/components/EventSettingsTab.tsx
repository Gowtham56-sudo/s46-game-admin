import { useState } from 'react';
import type { FormEvent } from 'react';
import type { EventSettings } from '../types';
import { Settings, Save, CheckCircle2, Upload } from 'lucide-react';
import { API_BASE } from '../config';

function ImageUploadInput({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder: string }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      try {
        const res = await fetch(`${API_BASE}/api/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, data: dataUrl })
        });
        const result = await res.json();
        if (result.success) {
          onChange(result.url);
        } else {
          alert(result.error || 'Upload failed');
        }
      } catch (err) {
        alert('Upload failed');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
      />
      <label className="shrink-0 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 font-bold text-sm cursor-pointer flex items-center gap-2 transition-colors">
        {uploading ? '...' : <><Upload className="w-4 h-4" /> Upload</>}
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </label>
    </div>
  );
}

interface Props {
  settings: EventSettings;
  onUpdateSettings: (newSettings: EventSettings) => void;
}

export default function EventSettingsTab({ settings, onUpdateSettings }: Props) {
  const [eventName, setEventName] = useState(settings.eventName || '');
  const [companyName, setCompanyName] = useState(settings.companyName || '');
  const [gameTitle, setGameTitle] = useState(settings.gameTitle || '');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const updated: EventSettings = {
      eventName,
      companyName,
      gameTitle,
      logoUrl,
      themeColor: settings.themeColor || 'blue',
      timerDurations: settings.timerDurations,
    };
    onUpdateSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl max-w-3xl">
      <div className="flex items-center gap-3 pb-6 border-b border-slate-800 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">Event & System Settings</h2>
          <p className="text-slate-400 text-sm">Configure event branding, title, and timer durations</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 font-bold flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Event settings saved successfully! Live display updated.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Event Name
            </label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. Mall Tech Challenge 2026"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Company / Organizer Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. s46 entertainment"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Game Title Header
          </label>
          <input
            type="text"
            value={gameTitle}
            onChange={(e) => setGameTitle(e.target.value)}
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            placeholder="e.g. s46 entertainment Quiz"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Company Logo Image URL
          </label>
          <ImageUploadInput
            value={logoUrl}
            onChange={setLogoUrl}
            placeholder="https://example.com/logo.png"
          />
        </div>



        <div className="pt-6 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 text-base cursor-pointer"
          >
            <Save className="w-5 h-5" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
