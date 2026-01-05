
import React, { useState } from 'react';
import { X, Cloud, Shield, Link, Info } from 'lucide-react';
import { db } from '../services/dbService';

interface CloudSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChange: () => void;
}

const CloudSettingsModal: React.FC<CloudSettingsModalProps> = ({ isOpen, onClose, onConfigChange }) => {
  const currentConfig = db.getCloudConfig();
  const [url, setUrl] = useState(currentConfig?.url || '');
  const [key, setKey] = useState(currentConfig?.key || '');

  if (!isOpen) return null;

  const handleSave = () => {
    if (url && key) {
      db.setCloudConfig({ url, key });
    } else {
      db.setCloudConfig(null);
    }
    onConfigChange();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg text-white">
              <Cloud size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Cloud Sync</h2>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Storage Settings</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-sm text-blue-800">
            <Info className="shrink-0" size={18} />
            <p>Connect your <strong>Supabase</strong> project to store data forever and share it across devices.</p>
          </div>

          <div>
            <label className="flex items-center text-sm font-semibold text-slate-700 mb-1">
              <Link size={14} className="mr-2" /> Project URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="https://xyz.supabase.co"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-semibold text-slate-700 mb-1">
              <Shield size={14} className="mr-2" /> Anon Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="eyJhbG..."
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all shadow-lg"
            >
              {url ? 'Update Cloud Connection' : 'Use Local Storage Only'}
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-3">
              Data is mirrored to Local Storage for offline access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudSettingsModal;
