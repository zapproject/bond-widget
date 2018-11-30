import { Message } from '../store/reducers';

export class MessageElement {
  private el: HTMLDivElement;
  private _message: Message;
  constructor(private container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'message';
    this.container.appendChild(this.el);
  }

  set message(message) {
    if (this._message === message) return;
    this._message = message;
    if (!this._message) {
      this.el.textContent = '';
      this.el.className = 'message';
      return;
    }
    this.el.textContent = this._message.text;
    this.el.className = 'message ' + this._message.type;
  }

  destroy() {
    this.container.removeChild(this.el);
  }
}