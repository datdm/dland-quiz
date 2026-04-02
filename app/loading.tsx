export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'var(--bg-grad)'}}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-t-transparent spin mx-auto mb-4"
          style={{borderColor:'var(--gold)',borderTopColor:'transparent'}} />
        <p className="text-sm tracking-widest font-cinzel" style={{color:'var(--gold)'}}>読み込み中...</p>
      </div>
    </div>
  );
}
