type Event = { name: string; payload: Record<string, unknown>; ts: number };
const sinks: Array<(e: Event) => void> = [];

export const kcAnalytics = {
  consent: false,
  use: (sink: (e: Event) => void) => sinks.push(sink),
  emit(name: string, payload: Record<string, unknown> = {}) {
    if (!kcAnalytics.consent) return;
    sinks.forEach((s) => s({ name, payload, ts: Date.now() }));
  },
};

declare global {
  interface Window {
    kcAnalytics?: typeof kcAnalytics;
  }
}
if (typeof window !== 'undefined') window.kcAnalytics = kcAnalytics;
