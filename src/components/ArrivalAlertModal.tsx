import React, { useState } from 'react';
import { BusServiceArrival, BusArrivalTiming } from '../types/transit';
import { Bell, Check, X, Volume2, ShieldCheck } from 'lucide-react';

interface ArrivalAlertModalProps {
  service: BusServiceArrival | null;
  timing: BusArrivalTiming | null;
  stopName: string;
  onClose: () => void;
  onArmAlarm: (serviceNo: string, thresholdMin: number) => void;
}

export const ArrivalAlertModal: React.FC<ArrivalAlertModalProps> = ({
  service,
  timing,
  stopName,
  onClose,
  onArmAlarm,
}) => {
  const [threshold, setThreshold] = useState<number>(2);
  const [isArmed, setIsArmed] = useState<boolean>(false);

  if (!service || !timing) return null;

  const handleArm = () => {
    // Play subtle audio tone using Web Audio API if available
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // AudioContext fallback
    }

    setIsArmed(true);
    onArmAlarm(service.serviceNo, threshold);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-[#E2E8F0] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-[#6E1D6B] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#161c24]">
              Next Bus Proximity Alert
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#82727e] hover:text-[#161c24] p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[#f8f9ff] border border-[#e9eefa] rounded-xl p-3.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-[6px] bg-[#6E1D6B] text-white font-extrabold text-base">
              {service.serviceNo}
            </span>
            <span className="text-xs font-bold text-[#161c24] tabular-nums">
              Next in {timing.minutes}m
            </span>
          </div>
          <div className="text-xs text-[#50434d]">
            To <strong>{service.destination}</strong> at <em>{stopName}</em>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#50434d] block">
            Notify me before arrival:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 5].map((mins) => (
              <button
                key={mins}
                onClick={() => setThreshold(mins)}
                className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  threshold === mins
                    ? 'bg-[#6E1D6B] text-white border-[#6E1D6B] shadow-xs'
                    : 'bg-white text-[#161c24] border-[#d4c1ce] hover:bg-[#f8f9ff]'
                }`}
              >
                {mins} min prior
              </button>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-[#82727e] flex items-center gap-1.5 pt-1">
          <Volume2 className="w-3.5 h-3.5 text-[#6E1D6B]" />
          <span>Plays haptic chime when vehicle enters corridor range</span>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-[#f1f5f9]">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-xs font-semibold text-[#50434d] hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleArm}
            disabled={isArmed}
            className="flex-1 py-2 text-xs font-bold text-white bg-[#6E1D6B] hover:bg-[#581755] rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            {isArmed ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Armed!</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Arm Reminder</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
