
import React from 'react';

interface ToolShellProps {
  onBack: () => void;
  title: string;
  subtitle?: string;
  titleColor?: string;
  subtitleColor?: string;
  loading?: boolean;
  loadingText?: string;
  loadingColor?: string;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  secondaryAction?: {
    label: string;
    onClick: () => void;
    active?: boolean;
  };
}

export const ToolShell: React.FC<ToolShellProps> = ({
  onBack,
  title,
  subtitle,
  titleColor = 'text-marker-black',
  subtitleColor = 'opacity-40',
  loading = false,
  loadingText = 'Processing...',
  loadingColor = 'border-marker-black',
  sidebar,
  children,
  secondaryAction
}) => {
  return (
    <div className="min-h-full flex flex-col items-center justify-start py-12 px-6 md:px-8 relative max-w-7xl mx-auto pb-48">
      <button
        onClick={onBack}
        className="fixed top-4 right-4 sm:top-8 sm:right-8 brutalist-button !text-[10px] sm:!text-sm !px-3 sm:!px-4 !py-1 z-50 bg-surface shadow-xl"
      >
        Index
      </button>

      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-16 items-start pt-12 lg:pt-0">
        <div className="w-full lg:w-[400px] space-y-12 lg:sticky lg:top-20">
          <header className="space-y-4">
            <h2 className={`heading-marker text-6xl ${titleColor} lowercase leading-none`}>{title}</h2>
            {subtitle && <p className={`handwritten text-lg ${subtitleColor} italic uppercase tracking-widest`}>{subtitle}</p>}
          </header>

          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className={`w-full py-3 marker-border text-[10px] font-bold uppercase tracking-widest transition-all ${secondaryAction.active ? 'bg-marker-black text-white shadow-lg' : 'bg-surface opacity-50 hover:opacity-100'}`}
            >
              {secondaryAction.label}
            </button>
          )}

          {sidebar && <div className="space-y-10">{sidebar}</div>}
        </div>

        <div className="flex-1 w-full min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] gap-8 animate-in fade-in">
              <div className={`w-20 h-20 border-2 ${loadingColor} border-t-transparent animate-spin rounded-full`}></div>
              <span className={`handwritten text-xl font-black animate-pulse uppercase tracking-[0.4em] ${loadingColor.replace('border-', 'text-')}`}>
                {loadingText}
              </span>
            </div>
          ) : (
            <div className="animate-in fade-in duration-700 h-full">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
