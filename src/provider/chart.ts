import { CurveSvgLineChart } from 'zap-curve-chart/lib/CurveSvgLineChart';
import { Curve } from 'zapjs';
import { checkCurveEqual } from '../utils';

export class Chart {

  private el: HTMLDivElement;
  private chartEl: HTMLDivElement;
  private chart: CurveSvgLineChart;

  private curveValues: HTMLDivElement;
  private curveString: HTMLDivElement;

  private _curve: Curve;
  private _dotsIssued: number;
  private updateScheduled = false;

  constructor(private container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'curve-chart-wrapper';

    this.curveValues = this.el.appendChild(document.createElement('div'));
    this.curveValues.className = 'curve-values';
    this.curveString = this.el.appendChild(document.createElement('div'));
    this.curveString.className = 'curve-string';

    this.chartEl = this.el.appendChild(document.createElement('div'));
    this.chartEl.className = 'curve-chart';
    this.chart = new CurveSvgLineChart(this.chartEl, { maxDots: 300, height: 150, width: 300 });
    this.container.appendChild(this.el);
  }

  set dotsIssued(dots) {
    const dotsIssued = Number(dots);
    if (isNaN(dotsIssued)) return;
    if (dotsIssued === this._dotsIssued) return;
    this._dotsIssued = dotsIssued;
    this.update();
  }

  set curve(curve: Curve) {
    if (checkCurveEqual(curve, this._curve)) return;
    this._curve = curve;
    this.update();
  }

  update() {
    if (!this._curve) return;
    // we do not want to update twice when dots and curve changed in one time
    if (this.updateScheduled) return;
    this.updateScheduled = true;
    requestAnimationFrame(() => {
      this.curveValues.textContent = JSON.stringify(this._curve.values);
      this.curveString.textContent = Chart.curveToString(this._curve);
      this.chart.draw(this._curve.values, this._dotsIssued);
      this.updateScheduled = false;
    });
  }

  private static curveToString(curve: Curve) {
    const values = curve.values;
    const length = values[0];
    let str = '';
    for (let i = length; i > 0; i--) { // convert each term into string
      let coeff = values[i];
      let pow = i - 1;
      if (coeff === 0) continue;
      if (i !== length) str += ' + ';
      str += coeff;
      if (pow !== 0) {
        str += 'x^' + pow;
      }
    }
    return str;
  }

  destroy() {
    this.chart.destroy();
    this.container.removeChild(this.el);
  }
}