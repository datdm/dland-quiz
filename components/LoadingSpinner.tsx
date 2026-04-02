'use client';
interface Props { size?: number; text?: string; }
export default function LoadingSpinner({ size=36, text }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="rounded-full border-2 border-t-transparent spin"
        style={{ width:size, height:size, borderColor:'var(--gold)', borderTopColor:'transparent' }} />
      {text && <p className="text-sm tracking-wide font-noto" style={{color:'var(--gold)',opacity:0.7}}>{text}</p>}
    </div>
  );
}
