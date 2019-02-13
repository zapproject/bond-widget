import { Curve } from '@zapjs/curve';
import { ZapSubscriber } from '@zapjs/subscriber';
import { showLoading, showError, updateWidget, updateUserInfo, hideMessage, showLogin } from '../store/actions';
import { checkCurveEqual } from '../utils';
import { UserInfo } from '../store/reducers';
import { DEFAULT_GAS } from '@zapjs/types';

export class BondForm {
  private el: HTMLFormElement;
  private bondDotsInput: HTMLInputElement;
  private bondDotsPrice: HTMLDivElement;
  private button: HTMLButtonElement;

  private loginPopup: HTMLDivElement;
  private loginButton: HTMLButtonElement;

  private _dotsIssued = 0;
  private _approved = 0;
  private _curve: Curve;
  private _subscriber: ZapSubscriber = null;
  private _userInfo: UserInfo = null;

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

  set disabled(disabled) {
    this.bondDotsInput.disabled = disabled;
    this.button.disabled = disabled;
    this.button.disabled = !this._subscriber;
  }

  set dotsIssued(dots) {
    const dotsIssued = Number(dots);
    if (isNaN(dotsIssued)) return;
    if (dotsIssued === this._dotsIssued) return;
    this._dotsIssued = dotsIssued;
    this.bondDotsInput.dispatchEvent(new Event('change'));
  }

  set curve(curve: Curve) {
    if (checkCurveEqual(curve, this._curve)) return;
    this._curve = curve;
    this.bondDotsInput.max = this._curve.max.toString();
    this.bondDotsInput.dispatchEvent(new Event('change'));
  }

  set userInfo(userInfo: UserInfo) {
    if (this._userInfo === userInfo) return;
    this._subscriber = userInfo.subscriber;
    this._approved = Number(userInfo.allowance);
    this.button.disabled = !this._subscriber;
    this.updateButtonTitle();
  }

  private handleShowLogin() {
    this.dispatch(showLogin());
  }

  private needZapApprove() {
    const dots = Number(this.el.dots.value) || 1;
    const zapRequired = this._curve.getZapRequired(this._dotsIssued || 1, isNaN(dots) ? 1 : dots);
    return zapRequired - this._approved > 0 ? zapRequired : 0;
  }

  private handleDotsChange(e) {
    if (!this._curve) return;
    const dots = Number(e.target.value);
    const dotsIssued = this._dotsIssued;
    try {
      this.updateButtonTitle();
      const zapRequired = this._curve.getZapRequired(dotsIssued || 1, dots);
      this.bondDotsPrice.textContent = zapRequired.toString();
    } catch (e) {
      console.log(e);
      // this.bondDotsInput.value = this._curve.max.toString();
      // this.bondDotsPrice.textContent = this._curve.getZapRequired(dotsIssued, this._curve.max - dotsIssued).toString();
    }
  }

  private updateButtonTitle() {
    if (!this._curve) return;
    const approve = this.needZapApprove();
    this.button.textContent = approve > 0 ? 'Approve ' + approve.toString() + ' ZAP' : 'Bond';
  }

  private async handleBondDotsSubmit(e) {
    e.preventDefault();
    if (!this._subscriber) return;
    const dots = Number(this.el.dots.value);
    try {
      const approve = this.needZapApprove();
      if (approve > 0) {
        this.dispatch(showLoading('Approving ...', this.widgetID));
        await this.handleApprove(approve);
      } else {
        this.dispatch(showLoading('Bonding ...', this.widgetID));
        await this._subscriber.bond({provider: this.providerAddress, endpoint: this.endpoint, dots});
      }
      this.dispatch(hideMessage(this.widgetID));
      this.dispatch(updateUserInfo());
      this.dispatch(updateWidget(this.widgetID));
      if (!approve) this.bondDotsInput.value = '1';
      this.bondDotsInput.dispatchEvent(new Event('change'));
    } catch (e) {
      console.log(e);
      this.dispatch(showError(e.message, this.widgetID));
      setTimeout(() => {
        this.dispatch(hideMessage(this.widgetID));
      }, 5000);
    }
  }

  private async handleApprove(zap) {
    const txid = await this._subscriber.zapToken.contract.methods.approve(this._subscriber.zapBondage.contract._address, zap.toString()).send({
      from: this._subscriber.subscriberOwner,
      gas: DEFAULT_GAS,
    });
    return txid;
  }

  destroy() {
    this.el.removeEventListener('submit', this.handleBondDotsSubmit);
    this.loginButton.removeEventListener('click', this.handleShowLogin);
    this.bondDotsInput.removeEventListener('change', this.handleDotsChange);
    this.container.removeChild(this.el);
  }
}