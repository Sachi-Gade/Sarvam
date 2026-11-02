import React, { useState, useEffect } from 'react';
import { 
  Headphones, 
  Volume2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Sparkles,
  Search,
  Languages
} from 'lucide-react';
import { api } from '../api';
import AlertBadge from '../components/AlertBadge';

export default function CallHistoryPage() {
  const [calls, setCalls] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCalls({ limit: 100 });
      setCalls(data);
      if (data.length > 0) {
        // Load first call detail
        loadCallDetail(data[0].id);
      }
    } catch (err) {
      console.error("Error loading calls:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCallDetail = async (callId) => {
    try {
      const detail = await api.getCallDetail(callId);
      setSelectedCall(detail);
    } catch (err) {
      console.error("Error loading call detail:", err);
    }
  };

  const handlePlayAudio = (base64Audio, id) => {
    if (!base64Audio) return;
    try {
      const audioUrl = `data:audio/wav;base64,${base64Audio}`;
      const audio = new Audio(audioUrl);
      setCurrentPlayingId(id);
      audio.play();
      audio.onended = () => setCurrentPlayingId(null);
    } catch (e) {
      console.error("Playback error:", e);
      setCurrentPlayingId(null);
    }
  };

  return (
    <div className="p-8 space-y-6">
      
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">Voice Call Records & Transcripts</h3>
            <p className="text-xs text-slate-500">Auditable conversational records across Hindi, Marathi, Punjabi and English</p>
          </div>
        </div>
      </div>

      {/* Grid: Calls List (1 col) + Transcript Viewer (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left List of Calls */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-2.5 max-h-[700px] overflow-y-auto">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recorded Call Sessions</h4>
          {calls.map((c) => {
            const isSelected = selectedCall?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => loadCallDetail(c.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20' 
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-slate-800">{c.call_sid}</span>
                  <AlertBadge priority={c.urgency_level} />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-brand-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                    {c.language_code}
                  </span>
                  <span>{new Date(c.created_at).toLocaleDateString()} • {c.duration_seconds}s</span>
                </div>
                <p className="text-xs text-slate-600 mt-2 line-clamp-1 font-medium">{c.call_summary || c.conversation_outcome}</p>
              </div>
            );
          })}
        </div>

        {/* Right Transcript Viewer */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between max-h-[700px] overflow-hidden">
          {selectedCall ? (
            <div className="flex flex-col h-full overflow-hidden">
              
              {/* Transcript Header */}
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-800">{selectedCall.call_sid}</h3>
                    <AlertBadge priority={selectedCall.urgency_level} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Recorded on {new Date(selectedCall.created_at).toLocaleString()} • Duration: {selectedCall.duration_seconds} seconds
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Outcome</span>
                  <span className="text-xs font-bold text-slate-800">{selectedCall.conversation_outcome}</span>
                </div>
              </div>

              {/* Call Summary Banner */}
              {selectedCall.call_summary && (
                <div className="my-3 p-3 bg-brand-50/70 border border-brand-100 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-brand-800">
                    <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                    <span>Structured Clinical Call Summary</span>
                  </div>
                  <p className="text-slate-700">{selectedCall.call_summary}</p>
                  {selectedCall.call_summary_vernacular && (
                    <p className="text-brand-700 italic font-medium">"{selectedCall.call_summary_vernacular}"</p>
                  )}
                </div>
              )}

              {/* Turn-by-Turn Dialogues */}
              <div className="flex-1 overflow-y-auto space-y-3 p-2">
                {selectedCall.transcripts?.map((tr) => (
                  <div 
                    key={tr.id}
                    className={`flex flex-col ${tr.speaker === 'AI' ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 font-bold uppercase">
                      <span>{tr.speaker === 'AI' ? 'Sarvam Health Assistant' : 'Patient'}</span>
                      {tr.audio_base64 && (
                        <button 
                          onClick={() => handlePlayAudio(tr.audio_base64, tr.id)}
                          className="text-brand-600 hover:text-brand-800 flex items-center gap-1 ml-2 lowercase font-normal"
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${currentPlayingId === tr.id ? 'animate-pulse text-brand-600' : ''}`} />
                          <span>Replay audio</span>
                        </button>
                      )}
                    </div>

                    <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs ${
                      tr.speaker === 'AI' 
                        ? 'bg-slate-100 text-slate-800 rounded-tl-sm' 
                        : 'bg-brand-600 text-white rounded-tr-sm'
                    }`}>
                      <p className="font-medium text-sm leading-relaxed">{tr.message_text}</p>
                      {tr.translated_text_en && tr.translated_text_en !== tr.message_text && (
                        <p className={`text-[11px] mt-1.5 pt-1.5 border-t italic ${
                          tr.speaker === 'AI' ? 'border-slate-200 text-slate-500' : 'border-brand-500 text-brand-100'
                        }`}>
                          "{tr.translated_text_en}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Select a call session to view transcripts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

