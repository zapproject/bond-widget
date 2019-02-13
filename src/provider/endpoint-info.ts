import { ZapProvider } from '@zapjs/provider';

export class EndpointInfo {
  private el: HTMLDivElement;
  private endpointTitle: HTMLDivElement;
  private providerTitle: HTMLDivElement;
  private dotsIssued: HTMLDivElement
  private nextDotPrice: HTMLDivElement

  private _endpoint: string;
  private _provider: ZapProvider;
  private _dots: string;

  constructor(private container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'endpoint-info';

    this.providerTitle = this.el.appendChild(document.createElement('div'));
    this.providerTitle.className = 'provider-title'
    this.endpointTitle = this.el.appendChild(document.createElement('div'));
    this.endpointTitle.className = 'endpoint-title'
    this.dotsIssued = this.el.appendChild(document.createElement('div'));
    this.dotsIssued.className = 'dots-issued'
    // this.nextDotPrice = this.el.appendChild(document.createElement('div'));
    // this.nextDotPrice.className = 'next-dot-price';

    this.container.appendChild(this.el);
  }

  set dots(dots) {
    if (dots === this._dots) return;
    this._dots = dots;
    this.dotsIssued.textContent = this._dots;
  }
  set provider(provider: ZapProvider) {
    if (provider === this._provider) return;
    this._provider = provider;
    if (!this._provider) return;
    this.providerTitle.textContent = this._provider.title;
  }
  set endpoint(endpoint: string) {
    if (endpoint === this._endpoint) return;
    this._endpoint = endpoint;
    this.endpointTitle.textContent = this._endpoint;
  }

  destroy() {
    this.container.removeChild(this.el);
  }
}