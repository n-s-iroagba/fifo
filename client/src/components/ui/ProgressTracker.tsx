import React from 'react';

interface Stage {
    id: number;
    name: string;
    status: 'completed' | 'current' | 'upcoming';
    requiresPayment?: boolean;
}

export function ProgressTracker({ stages, currentPercent }: { stages: Stage[], currentPercent: number }) {
    return (
        <div className="w-full py-4">
            <div className="relative flex justify-between">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-blue-200 -translate-y-1/2 z-0" />
                <div
                    className="absolute top-1/2 left-0 h-0.5 bg-success -translate-y-1/2 z-0 transition-all duration-500"
                    style={{ width: `${currentPercent}%` }}
                />

                {stages.map((stage, i) => (
                    <div key={stage.id} className="relative z-10 flex flex-col items-center group">
                        <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${stage.status === 'completed'
                                ? 'bg-success border-success text-white'
                                : stage.status === 'current'
                                    ? 'bg-surface border-primary text-primary animate-pulse'
                                    : 'bg-surface border-blue-200 text-blue-400'
                                }`}
                        >
                            {stage.status === 'completed' ? (
                                <span className="text-[10px]">✓</span>
                            ) : (
                                <span className="text-[10px]">{i + 1}</span>
                            )}
                        </div>
                        <div className="absolute top-8 text-center min-w-[80px]">
                            <p className={`text-[10px] font-semibold ${stage.status === 'current' ? 'text-primary' : 'text-text-secondary'}`}>
                                {stage.name}
                            </p>
                            {stage.requiresPayment && (
                                <span className="text-[8px] text-warning font-bold uppercase">$ Required</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-12 text-center">
                <p className="text-xs text-text-secondary italic">
                    {currentPercent === 100
                        ? "Application complete! 🎉"
                        : `Progress: ${currentPercent}% — keep going! 💪`}
                </p>
            </div>
        </div>
    );
}
