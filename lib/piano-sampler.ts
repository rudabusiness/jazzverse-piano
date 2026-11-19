const anchors = [
  [21, 'A0'], [24, 'C1'], [30, 'Fs1'], [36, 'C2'], [42, 'Fs2'],
  [48, 'C3'], [54, 'Fs3'], [60, 'C4'], [66, 'Fs4'], [72, 'C5'],
  [78, 'Fs5'], [84, 'C6'], [90, 'Fs6'], [96, 'C7'], [102, 'Fs7'], [108, 'C8'],
] as const;

export class PianoSampler {
  private context: AudioContext | undefined;
  private readonly samples = new Map<string, Promise<AudioBuffer>>();

  private sample(name: string, context: AudioContext) {
    const cached = this.samples.get(name);
    if (cached) return cached;
    const pending = fetch(`/piano-samples/${name}.mp3`)
      .then(response => {
        if (!response.ok) throw new Error('Piano sample unavailable');
        return response.arrayBuffer();
      })
      .then(data => context.decodeAudioData(data));
    this.samples.set(name, pending);
    void pending.catch(() => this.samples.delete(name));
    return pending;
  }

  async play(pitches: readonly number[]) {
    if (!pitches.length) return;
    const context = this.context ??= new AudioContext();
    await context.resume();
    const voices = await Promise.all(pitches.map(async pitch => {
      const [root, name] = anchors.reduce((nearest, anchor) =>
        Math.abs(anchor[0] - pitch) < Math.abs(nearest[0] - pitch) ? anchor : nearest,
      );
      return { buffer: await this.sample(name, context), pitch, root };
    }));
    if (this.context !== context) return;
    const start = context.currentTime;
    for (const { buffer, pitch, root } of voices) {
      const source = context.createBufferSource();
      const gain = context.createGain();
      source.buffer = buffer;
      source.playbackRate.value = 2 ** ((pitch - root) / 12);
      gain.gain.setValueAtTime(Math.min(.65, 1.25 / voices.length), start);
      gain.gain.exponentialRampToValueAtTime(.001, start + .9);
      source.connect(gain);
      gain.connect(context.destination);
      source.onended = () => {
        source.disconnect();
        gain.disconnect();
      };
      source.start(start);
      source.stop(start + .9);
    }
  }

  close() {
    const context = this.context;
    this.context = undefined;
    this.samples.clear();
    if (context && context.state !== 'closed') void context.close();
  }
}
