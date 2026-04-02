'use client';
interface Props { size?: number; text?: string; }
export default function LoadingSpinner({ size=36, text }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="rounded-full border-2 border-t-transparent spin"
        style={{ width:size, height:size, borderColor:'rgba(245,158,11,0.8)', borderTopColor:'transparent' }} />
      {text && <p className="text-amber-400/60 text-sm tracking-wide font-noto">{text}</p>}
    </div>
  );
}
