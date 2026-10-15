// Efficiency stands in for time/space complexity, which Judge0 cannot measure directly:
// the closer the slowest test gets to the time limit (and the hungriest to the memory limit),
// the lower the multiplier. A wrong complexity class usually fails large tests with TLE instead.
//
//   efficiency = clamp(1 - 0.3 × (0.7 × timeRatio + 0.3 × memoryRatio), 0.7, 1)
//   score      = points × (passed / total) × efficiency
//
// See docs/database.md#scoring.

const TIME_WEIGHT = 0.7;
const MEMORY_WEIGHT = 0.3;
const MAX_PENALTY = 0.3;

export function computeEfficiency(maxTimeMs: number | null, timeLimitMs: number, maxMemoryKb: number | null, memoryLimitKb: number): number {
  const timeRatio = Math.min(1, (maxTimeMs ?? 0) / timeLimitMs);
  const memoryRatio = Math.min(1, (maxMemoryKb ?? 0) / memoryLimitKb);
  const efficiency = 1 - MAX_PENALTY * (TIME_WEIGHT * timeRatio + MEMORY_WEIGHT * memoryRatio);
  return Math.round(Math.min(1, Math.max(1 - MAX_PENALTY, efficiency)) * 1000) / 1000;
}

export function computeScore(points: number, passed: number, total: number, efficiency: number): number {
  if (passed === 0 || total === 0) return 0;
  return Math.round(points * (passed / total) * efficiency * 100) / 100;
}
