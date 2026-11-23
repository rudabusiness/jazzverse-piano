import { demoLesson } from './lesson';
import { advanceLoop, timeAt, type ClockSegment, type PracticeTimeline } from './lesson-timeline';

export function metronomePulses(practice: PracticeTimeline, segment: ClockSegment) {
  const [beatsPerMeasure] = demoLesson.timeSignature;
  const firstBeat = Math.max(-beatsPerMeasure, Math.ceil(segment.offsetMs / practice.beatMs));
  return Array.from({ length: Math.max(0, practice.durationBeats - firstBeat) }, (_, index) => {
    const beat = firstBeat + index;
    return {
      timestamp: segment.startedAt + beat * practice.beatMs - segment.offsetMs,
      accented: beat % beatsPerMeasure === 0,
    };
  });
}

const LOOKAHEAD_MS = 100;
const CLICK_DURATION = 0.05;

export class PracticeMetronome {
  private timer: number | undefined;
  private readonly oscillators = new Set<OscillatorNode>();

  constructor(private readonly context: AudioContext) {}

  start(practice: PracticeTimeline, segment: ClockSegment) {
    this.stop();
    let cycle = segment;
    let pulses = metronomePulses(practice, cycle);
    let next = 0;
    const schedule = () => {
      if (this.context.state !== 'running') return;
      const now = performance.now();
      const audioNow = this.context.currentTime;
      const currentCycle = advanceLoop(cycle, now, practice);
      if (currentCycle) {
        cycle = currentCycle;
        pulses = metronomePulses(practice, cycle);
        next = 0;
      }
      while (next < pulses.length && pulses[next].timestamp <= now + LOOKAHEAD_MS) {
        const pulse = pulses[next++];
        const delay = pulse.timestamp - now;
        // Skip stale pulses if the tab was throttled or the audio context was suspended.
        if (delay >= -25) this.click(audioNow + Math.max(0, delay) / 1000, pulse.accented);
      }
      if (next < pulses.length) return;
      if (practice.range) {
        const boundary = now + practice.durationMs - timeAt(cycle, now);
        cycle = { startedAt: boundary, offsetMs: 0 };
        pulses = metronomePulses(practice, cycle);
        next = 0;
        return;
      }
      window.clearInterval(this.timer);
      this.timer = undefined;
    };
    this.timer = window.setInterval(schedule, 25);
    schedule();
  }

  stop() {
    window.clearInterval(this.timer);
    this.timer = undefined;
    for (const oscillator of this.oscillators) {
      oscillator.stop();
      oscillator.disconnect();
    }
    this.oscillators.clear();
  }

  private click(at: number, accented: boolean) {
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.frequency.value = accented ? 1200 : 800;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(accented ? 0.17 : 0.1, at + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + CLICK_DURATION);
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    this.oscillators.add(oscillator);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
      this.oscillators.delete(oscillator);
    };
    oscillator.start(at);
    oscillator.stop(at + CLICK_DURATION);
  }
}
