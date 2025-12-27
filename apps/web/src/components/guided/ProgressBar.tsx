"use client";

interface ProgressBarProps {
  completed: number;
  total: number;
  blockingCompleted: number;
  blockingTotal: number;
}

export function ProgressBar({
  completed,
  total,
  blockingCompleted,
  blockingTotal,
}: ProgressBarProps) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const allBlockingDone = blockingCompleted === blockingTotal;

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">
            {completed} / {total} steps
          </span>
          {blockingTotal > 0 && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                allBlockingDone
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {blockingCompleted}/{blockingTotal} blocking
            </span>
          )}
        </div>
        <span className="text-sm font-semibold text-brand">{percent}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand transition-all duration-300 ease-out rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
