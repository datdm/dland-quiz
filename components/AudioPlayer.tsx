'use client';
import { useEffect, useRef, useState } from 'react';
import { Play, Square, Volume2 } from 'lucide-react';

interface Props {
  audioUrl: string;
  label?: string;
}

export default function AudioPlayer({ audioUrl, label = '▶ 音声を再生' }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing,   setPlaying]   = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [duration,  setDuration]  = useState(0);
  const [error,     setError]     = useState(false);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.onloadedmetadata = () => setDuration(audio.duration);
    audio.ontimeupdate     = () => setProgress(audio.currentTime / (audio.duration || 1));
    audio.onended          = () => { setPlaying(false); setProgress(0); };
    audio.onerror          = () => setError(true);
    return () => { audio.pause(); audio.src = ''; };
  }, [audioUrl]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else         { audio.play().catch(() => setError(true)); setPlaying(true); }
  };

  const fmtTime = (s: number) => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl mb-4"
      style={{ background:'var(--bg-option)', border:'1px solid var(--teal)', borderColor:'color-mix(in srgb, var(--teal) 40%, transparent)' }}>
      {/* Play/Stop button */}
      <button
        onClick={toggle}
        disabled={error}
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          background: error
            ? 'rgba(239,68,68,0.2)'
            : playing
            ? 'linear-gradient(135deg, var(--teal-dark), var(--teal))'
            : 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
          boxShadow: playing ? '0 0 12px color-mix(in srgb, var(--teal) 50%, transparent)' : 'none',
        }}
      >
        {error
          ? <Volume2 size={16} style={{color:'#ef4444'}} />
          : playing
          ? <Square size={14} style={{color:'#fff'}} />
          : <Play  size={14} style={{color:'#030308'}} />
        }
      </button>

      {/* Waveform animation + label */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {playing && (
            <div className="flex items-end gap-0.5 h-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1 rounded-full audio-wave-bar"
                  style={{ height:'16px', background:'var(--teal)',
                    animationDelay:`${i*0.1}s` }} />
              ))}
            </div>
          )}
          <span className="text-xs font-noto" style={{color: error ? '#ef4444' : 'var(--teal)'}}>
            {error ? 'Không thể tải audio' : playing ? '再生中...' : label}
          </span>
        </div>
        {/* Progress bar */}
        {duration > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full overflow-hidden"
              style={{background:'color-mix(in srgb, var(--teal) 20%, transparent)'}}>
              <div className="h-full rounded-full transition-all"
                style={{width:`${progress*100}%`, background:'var(--teal)'}} />
            </div>
            <span className="text-xs" style={{color:'var(--text-muted)', fontFamily:'monospace'}}>
              {fmtTime(duration * progress)}/{fmtTime(duration)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
