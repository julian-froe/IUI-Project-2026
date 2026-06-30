export class OneEuroFilter {
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;
  private xPrev: number | null = null;
  private dxPrev: number = 0;
  private tPrev: number | null = null;

  constructor(minCutoff: number = 1.0, beta: number = 0.0, dCutoff: number = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
  }

  reset() {
    this.xPrev = null;
    this.dxPrev = 0;
    this.tPrev = null;
  }

  private alpha(tE: number, cutoff: number) {
    const tau = 1.0 / (2 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / tE);
  }

  filter(x: number, t: number): number {
    if (this.xPrev === null || this.tPrev === null) {
      this.xPrev = x;
      this.tPrev = t;
      return x;
    }

    const tE = (t - this.tPrev) / 1000.0;
    if (tE <= 0) return x;

    const dx = (x - this.xPrev) / tE;
    const alphaD = this.alpha(tE, this.dCutoff);
    const edx = dx * alphaD + this.dxPrev * (1.0 - alphaD);

    const cutoff = this.minCutoff + this.beta * Math.abs(edx);
    const alphaP = this.alpha(tE, cutoff);
    const filteredX = x * alphaP + this.xPrev * (1.0 - alphaP);

    this.xPrev = filteredX;
    this.dxPrev = edx;
    this.tPrev = t;

    return filteredX;
  }
}
