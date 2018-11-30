import { Curve } from '@zapjs/curve';
import { ZapSubscriber } from '@zapjs/subscriber';
import { showLoading, showError, updateWidget, updateUserInfo, hideMessage } from '../store/actions';
import { Chart } from './chart';

export class BondForm {
  private el: HTMLFormElement;
  private bondDotsInput: HTMLInputElement;
  private bondDotsPrice: HTMLDivElement;
  private button: HTMLButtonElement;

  private loginPopup: HTMLDivElement;
  private loginButton: HTMLButtonElement;

  private _dotsIssued = 0;
  private _curve: Curve;
  private _subscriber: ZapSubscriber = null;

  constructor(
    private container: HTMLElement,
    private endpoint: string,
    private providerAddress: string,
    private widgetID: string,
    private dispatch,
  ) {
    this.handleDotsChange = this.handleDotsChange.bind(this);
    this.handleBondDotsSubmit = this.handleBondDotsSubmit.bind(this);
    this.handleShowLogin = this.handleShowLogin.bind(this);

    this.el = document.createElement('form');
    this.el.className = 'bond-form';
    this.el.addEventListener('submit', this.handleBondDotsSubmit);

    this.bondDotsInput = this.el.appendChild(document.createElement('input'));
    this.bondDotsInput.type = 'number';
    this.bondDotsInput.name = 'dots';
    this.bondDotsInput.min = '1';
    this.bondDotsInput.value = '1';
    this.bondDotsInput.addEventListener('change', this.handleDotsChange);

    this.bondDotsPrice = this.el.appendChild(document.createElement('div'));
    this.bondDotsPrice.className = 'bond-dots-price';

    this.button = this.el.appendChild(document.createElement('button'));
    this.button.type = 'submit';
    this.button.textContent = 'Bond';
    this.button.disabled = !this._subscriber;

    this.loginPopup = this.el.appendChild(document.createElement('div'));
    this.loginPopup.className = 'login-popup';
    this.loginPopup.appendChild(document.createTextNode('To bond log in using your metamask extension or '));
    this.loginButton = this.loginPopup.appendChild(document.createElement('button'));
    this.loginButton.textContent = 'Login with seed';
    this.loginButton.type = 'button';
    this.loginButton.addEventListener('click', this.handleShowLogin);

    this.container.appendChild(this.el);
  }

  set dotsIssued(dots) {
    const dotsIssued = Number(dots);
    if (isNaN(dotsIssued)) return;
    if (dotsIssued === this._dotsIssued) return;
    this._dotsIssued = dotsIssued;
    this.bondDotsInput.dispatchEvent(new Event('change'));
  }

  set curve(curve: Curve) {
    if (!Chart.curveChanged(curve, this._curve)) return;
    this._curve = curve;
    this.bondDotsInput.max = this._curve.max.toString();
    this.bondDotsInput.dispatchEvent(new Event('change'));
  }

  set subscriber(subscriber: ZapSubscriber) {
    if (this._subscriber === subscriber) return;
    this._subscriber = subscriber;
    this.button.disabled = !this._subscriber;
  }

  private handleShowLogin() {
    // TODO add action
  }

  private handleDotsChange(e) {
    if (!this._curve) return;
    const dots = Number(e.target.value);
    const dotsIssued = this._dotsIssued;
    try {
      this.bondDotsPrice.textContent = this._curve.getZapRequired(dotsIssued || 1, dots).toString();
    } catch (e) {
      console.log(e);
      // this.bondDotsInput.value = this._curve.max.toString();
      // this.bondDotsPrice.textContent = this._curve.getZapRequired(dotsIssued, this._curve.max - dotsIssued).toString();
    }
  }

  private async handleBondDotsSubmit(e) {
    e.preventDefault();
    if (!this._subscriber) return;
    const dots = Number(this.el.dots.value);
    this.dispatch(showLoading('Bonding ...', this.widgetID));
    this.bondDotsInput.disabled = true;
    this.button.disabled = true;
    try {
      await this._subscriber.bond({provider: this.providerAddress, endpoint: this.endpoint, dots});
      this.dispatch(hideMessage(this.widgetID));
      this.dispatch(updateUserInfo());
      this.dispatch(updateWidget(this.widgetID));
      this.bondDotsInput.value = '1';
      this.bondDotsInput.dispatchEvent(new Event('change'));
      this.bondDotsInput.disabled = false;
      this.button.disabled = false;
    } catch (e) {
      console.log(e);
      this.dispatch(showError(e.message, this.widgetID));
      setTimeout(() => {
        this.dispatch(hideMessage(this.widgetID));
      }, 5000);
      this.bondDotsInput.disabled = false;
      this.button.disabled = false;
    }
  }

  destroy() {
    this.el.removeEventListener('submit', this.handleBondDotsSubmit);
    this.loginButton.removeEventListener('click', this.handleShowLogin);
    this.bondDotsInput.removeEventListener('change', this.handleDotsChange);
    this.container.removeChild(this.el);
  }
}