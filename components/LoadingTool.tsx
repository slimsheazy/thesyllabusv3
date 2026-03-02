export const LoadingTool = () => (
  <div className="w-full h-full min-h-full flex flex-col items-center justify-center gap-4 bg-surface animate-in fade-in duration-300">
    <div className="w-12 h-12 border-4 border-marker-black border-t-transparent animate-spin rounded-full"></div>
    <span className="handwritten text-xs uppercase tracking-widest font-bold">Retrieving Archival Node...</span>
  </div>
);
