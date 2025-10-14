import React, { useEffect, useState } from 'react';
import ApiService from '../services/apiService';

type SliderText = { _id: string; text: string; is_active: boolean; created_at: string; updated_at: string };

const TextSliderPage: React.FC = () => {
  const [items, setItems] = useState<SliderText[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getSliderTexts();
      setItems(res.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!input.trim()) return;
    const token = 'admin-token';
    await ApiService.createSliderText({ text: input.trim() }, token);
    setInput('');
    load();
  };

  const update = async (id: string, text: string) => {
    const token = 'admin-token';
    await ApiService.updateSliderText(id, { text }, token);
    load();
  };

  const remove = async (id: string) => {
    const token = 'admin-token';
    await ApiService.deleteSliderText(id, token);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <h2 className="text-2xl font-bold mb-4">Add Slider Sentence</h2>
        <div className="flex gap-3">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter sentence" className="flex-1 border rounded-lg px-4 py-2" />
          <button onClick={add} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg">Add</button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow">
        <h2 className="text-xl font-bold mb-4">Sentences</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it._id} className="flex items-center gap-3 border rounded-lg p-3">
                <input defaultValue={it.text} onBlur={(e) => update(it._id, e.target.value)} className="flex-1 border rounded px-3 py-2" />
                <button onClick={() => remove(it._id)} className="text-red-600 hover:underline">Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextSliderPage;


