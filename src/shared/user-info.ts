import { UserInfo } from "../store/reducers";

export class UserInfoElement {

  private el: HTMLDivElement;
  private _address: string;

  private userAddress: HTMLDivElement;
  private zap: HTMLDivElement;
  private eth: HTMLDivElement;
  private dots: HTMLDivElement;

  constructor(private container: HTMLElement, private widgetID: string) {
    this.el = document.createElement('div');
    this.el.className = 'user-info';
    this.el.hidden = true;

    this.userAddress = this.el.appendChild(document.createElement('div'));
    this.userAddress.className = 'user-address';
    this.zap = this.el.appendChild(document.createElement('div'));
    this.zap.className = 'user-zap';
    this.eth = this.el.appendChild(document.createElement('div'));
    this.eth.className = 'user-eth';
    this.dots = this.el.appendChild(document.createElement('div'));
    this.dots.className = 'user-dots';

    this.container.appendChild(this.el);
  }

  set userInfo(userInfo: UserInfo) {
    if (!userInfo) {
      this.el.hidden = true;
      return;
    }
    this.el.hidden = false;
    this.zap.textContent = userInfo.zap;
    this.eth.textContent = userInfo.eth;
    const dots = userInfo.dotsPerEndpoint.find(e => e.widgetID === this.widgetID);
    if (dots) this.dots.textContent = dots.dots;
  }

  set address(address: string) {
    if (address === this._address) return;
    this._address = address;
    this.el.hidden = !this._address;
    this.userAddress.textContent = this._address;
  }

  destroy() {
    this.container.removeChild(this.el);
  }
}