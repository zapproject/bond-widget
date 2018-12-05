import { Message } from '../store/reducers';

export class MessageElement {
  private el: HTMLDivElement;
  private _message: Message;
  private className = 'zap-bond-widget__message'
  constructor(private container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = this.className;
    this.container.appendChild(this.el);
  }

  set message(message: Message) {
    if (this._message === message) return;
    this._message = message;
    if (!this._message) {
      this.el.textContent = '';
      this.el.className = this.className;
      return;
    }
    this.el.textContent = this._message.text;
    this.el.className = this.className + ' ' + this._message.type;
  }

  destroy() {
    this.container.removeChild(this.el);
  }
}