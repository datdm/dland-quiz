export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-amber-500 border-t-transparent spin mx-auto mb-4" />
        <p className="text-amber-400/70 text-sm tracking-widest font-cinzel">読み込み中...</p>
      </div>
    </div>
  );
}
