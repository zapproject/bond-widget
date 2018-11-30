import * as marked from 'marked';

export class EndpointMarkdown {
  private el: HTMLDivElement;

  private _markdown: string;

  constructor(private container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'markdown-body';
    this.container.appendChild(this.el);
  }

  set markdown(markdown) {
    if (this.markdown === markdown) return;
    this._markdown = markdown;
    this.el.innerHTML = this._markdown ? marked(this._markdown) : '';
  }

  destroy() {
    this.container.removeChild(this.el);
  }
}