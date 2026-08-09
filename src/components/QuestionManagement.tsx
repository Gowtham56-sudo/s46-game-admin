import { useState } from 'react';
import type { QuestionsData, AudioQuestion, ConnectionsQuestion } from '../types';
import { Volume2, Grid, Plus, Trash2, Edit2, RotateCcw, Save, X, Upload } from 'lucide-react';
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
        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
      />
      <label className="shrink-0 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 font-bold text-xs cursor-pointer flex items-center gap-1 transition-colors">
        {uploading ? '...' : <><Upload className="w-3 h-3" /> Upload</>}
        <input type="file" accept="image/*,audio/*" className="hidden" onChange={handleFileChange} />
      </label>
    </div>
  );
}

interface Props {
  questions: QuestionsData;
  onRefreshQuestions: () => void;
}

export default function QuestionManagement({ questions, onRefreshQuestions }: Props) {
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);
  const [editingItem, setEditingItem] = useState<unknown | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form states for Round 1 & Round 3 (Connections)
  const [rConnTitle, setRConnTitle] = useState('Guess the Place');
  const [rConnImg1, setRConnImg1] = useState('');
  const [rConnImg2, setRConnImg2] = useState('');
  const [rConnImg3, setRConnImg3] = useState('');
  const [rConnImg4, setRConnImg4] = useState('');
  const [rConnAnswer, setRConnAnswer] = useState('');
  const [rConnHint, setRConnHint] = useState('');

  // Form states for Round 2 (Audio)
  const [r2Title, setR2Title] = useState('Guess the Movie');
  const [r2Synth, setR2Synth] = useState<'windows' | 'retro' | 'ringtone' | 'dialup' | 'sci_fi' | '8bit' | 'piano'>('windows');
  const [r2AudioUrl, setR2AudioUrl] = useState('');
  const [r2Answer, setR2Answer] = useState('');
  const [r2Hint, setR2Hint] = useState('');
  const [r2Desc, setR2Desc] = useState('');

  const handleResetQuestions = async () => {
    if (!confirm('Are you sure you want to reset all questions to the default 30 questions?')) return;
    try {
      await fetch(`${API_BASE}/api/questions/reset`, { method: 'POST' });
      onRefreshQuestions();
    } catch (e) {
      alert('Error resetting questions.');
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsAddingNew(true);

    if (activeTab === 1 || activeTab === 3) {
      setRConnTitle(activeTab === 1 ? 'Guess the Place' : 'Guess the Song');
      setRConnImg1('');
      setRConnImg2('');
      setRConnImg3('');
      setRConnImg4('');
      setRConnAnswer('');
      setRConnHint('');
    } else if (activeTab === 2) {
      setR2Title('Guess the Movie');
      setR2Synth('windows');
      setR2AudioUrl('');
      setR2Answer('');
      setR2Hint('');
      setR2Desc('');
    }
  };

  const handleOpenEditModal = (item: unknown) => {
    setEditingItem(item);
    setIsAddingNew(false);

    if (activeTab === 1 || activeTab === 3) {
      const q = item as ConnectionsQuestion;
      setRConnTitle(q.title || (activeTab === 1 ? 'Guess the Place' : 'Guess the Song'));
      setRConnImg1(q.images[0] || '');
      setRConnImg2(q.images[1] || '');
      setRConnImg3(q.images[2] || '');
      setRConnImg4(q.images[3] || '');
      setRConnAnswer(q.correctAnswer || '');
      setRConnHint(q.hint || '');
    } else if (activeTab === 2) {
      const q = item as AudioQuestion;
      setR2Title(q.title || 'Guess the Movie');
      setR2Synth(q.synthPreset || 'windows');
      setR2AudioUrl(q.audioUrl || '');
      setR2Answer(q.correctAnswer || '');
      setR2Hint(q.hint || '');
      setR2Desc(q.description || '');
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm('Delete this question?')) return;
    const roundKey = `round${activeTab}` as keyof QuestionsData;
    const currentList = [...questions[roundKey]];
    currentList.splice(index, 1);

    // re-index question numbers
    currentList.forEach((q: unknown, i) => {
      (q as { questionNumber: number }).questionNumber = i + 1;
    });

    await fetch(`${API_BASE}/api/questions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ round: activeTab, questions: currentList }),
    });
    onRefreshQuestions();
  };

  const handleSaveQuestion = async () => {
    const roundKey = `round${activeTab}` as keyof QuestionsData;
    const currentList = [...questions[roundKey]] as unknown[];

    if (activeTab === 1 || activeTab === 3) {
      const newQ: ConnectionsQuestion = {
        id: isAddingNew ? `r${activeTab}_q_${Date.now()}` : (editingItem as ConnectionsQuestion).id,
        questionNumber: isAddingNew ? currentList.length + 1 : (editingItem as ConnectionsQuestion).questionNumber,
        title: rConnTitle,
        images: [rConnImg1, rConnImg2, rConnImg3, rConnImg4].filter(Boolean),
        correctAnswer: rConnAnswer,
        hint: rConnHint,
      };

      if (isAddingNew) {
        currentList.push(newQ);
      } else {
        const idx = currentList.findIndex((item) => (item as ConnectionsQuestion).id === newQ.id);
        if (idx >= 0) currentList[idx] = newQ;
      }
    } else if (activeTab === 2) {
      const newQ: AudioQuestion = {
        id: isAddingNew ? `r2_q_${Date.now()}` : (editingItem as AudioQuestion).id,
        questionNumber: isAddingNew ? currentList.length + 1 : (editingItem as AudioQuestion).questionNumber,
        title: r2Title,
        synthPreset: r2Synth,
        audioUrl: r2AudioUrl,
        correctAnswer: r2Answer,
        hint: r2Hint,
        description: r2Desc,
      };

      if (isAddingNew) {
        currentList.push(newQ);
      } else {
        const idx = currentList.findIndex((item) => (item as AudioQuestion).id === newQ.id);
        if (idx >= 0) currentList[idx] = newQ;
      }
    }

    await fetch(`${API_BASE}/api/questions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ round: activeTab, questions: currentList }),
    });

    setIsAddingNew(false);
    setEditingItem(null);
    onRefreshQuestions();
  };

  const renderConnectionsList = (roundQuestions: ConnectionsQuestion[]) => (
    <div className="space-y-4">
      {roundQuestions.map((q, idx) => (
        <div
          key={q.id}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg hover:border-slate-700 transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-black flex items-center justify-center shrink-0">
              #{q.questionNumber}
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-white">{q.title}</h4>
              <div className="text-sm text-emerald-400 font-bold mt-1">
                Correct Answer: {q.correctAnswer}
              </div>
              <div className="flex items-center gap-2 mt-3">
                {/* Render only the images that have URLs */}
                {(() => {
                  const imgs = q.images.filter(Boolean);
                  return (
                    <div
                      className="flex gap-2"
                      style={{
                        // Distribute space equally based on number of images
                        justifyContent: 'flex-start',
                      }}
                    >
                      {imgs.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt="Clue thumbnail"
                          className={`object-cover rounded-lg border border-slate-700 bg-slate-950 ${imgs.length === 1 ? 'w-32 h-32' : 'w-12 h-12'}`}
                        />
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={() => handleOpenEditModal(q)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(idx)}
              className="p-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAudioList = (roundQuestions: AudioQuestion[]) => (
    <div className="space-y-4">
      {roundQuestions.map((q, idx) => (
        <div
          key={q.id}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg hover:border-slate-700 transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-black flex items-center justify-center shrink-0">
              #{q.questionNumber}
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-white">{q.title}</h4>
              <div className="text-sm text-emerald-400 font-bold mt-1">
                Correct Answer: {q.correctAnswer}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                <span>Preset: {q.synthPreset || 'Default'}</span>
                {q.hint && <span>Hint: {q.hint}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={() => handleOpenEditModal(q)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(idx)}
              className="p-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab(1)}
            className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 1
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Round 1 (Places)</span>
          </button>

          <button
            onClick={() => setActiveTab(2)}
            className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 2
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Round 2 (Movies)</span>
          </button>

          <button
            onClick={() => setActiveTab(3)}
            className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 3
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Round 3 (Songs)</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetQuestions}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 cursor-pointer border border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Defaults</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {activeTab === 1 && renderConnectionsList(questions.round1)}
      {activeTab === 2 && renderAudioList(questions.round2)}
      {activeTab === 3 && renderConnectionsList(questions.round3)}

      {/* Edit / Add Modal */}
      {(isAddingNew || editingItem !== null) && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">
                {isAddingNew ? `Add Question to Round ${activeTab}` : `Edit Round ${activeTab} Question`}
              </h3>
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingItem(null);
                }}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {activeTab === 2 && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      Question Title
                    </label>
                    <input
                      type="text"
                      value={r2Title}
                      onChange={(e) => setR2Title(e.target.value)}
                      placeholder="e.g. Guess the Movie Dialogue"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      MP3/WAV Audio URL
                    </label>
                    <ImageUploadInput
                      value={r2AudioUrl}
                      onChange={setR2AudioUrl}
                      placeholder="https://example.com/audio.mp3"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      Correct Answer
                    </label>
                    <input
                      type="text"
                      value={r2Answer}
                      onChange={(e) => setR2Answer(e.target.value)}
                      placeholder="e.g. Inception"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      Hint (Optional)
                    </label>
                    <input
                      type="text"
                      value={r2Hint}
                      onChange={(e) => setR2Hint(e.target.value)}
                      placeholder="e.g. Dream within a dream"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white"
                    />
                  </div>
                </>
              )}

              {(activeTab === 1 || activeTab === 3) && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      Round Title
                    </label>
                    <input
                      type="text"
                      value={rConnTitle}
                      onChange={(e) => setRConnTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      Correct Connection Answer
                    </label>
                    <input
                      type="text"
                      value={rConnAnswer}
                      onChange={(e) => setRConnAnswer(e.target.value)}
                      placeholder="e.g. Paris or Bohemian Rhapsody"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      Hint (Optional)
                    </label>
                    <input
                      type="text"
                      value={rConnHint}
                      onChange={(e) => setRConnHint(e.target.value)}
                      placeholder="e.g. Helpful hint text"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase text-slate-400">4 Image URLs</label>
                    <ImageUploadInput
                      value={rConnImg1}
                      onChange={setRConnImg1}
                      placeholder="Image 1 URL"
                    />
                    <ImageUploadInput
                      value={rConnImg2}
                      onChange={setRConnImg2}
                      placeholder="Image 2 URL"
                    />
                    <ImageUploadInput
                      value={rConnImg3}
                      onChange={setRConnImg3}
                      placeholder="Image 3 URL"
                    />
                    <ImageUploadInput
                      value={rConnImg4}
                      onChange={setRConnImg4}
                      placeholder="Image 4 URL"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingItem(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuestion}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Question</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
