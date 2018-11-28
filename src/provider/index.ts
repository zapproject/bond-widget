import { State, VIEW } from "../store/reducers";
import { ZapSubscriber } from "@zapjs/subscriber";
import { ZapRegistry } from "@zapjs/registry/lib/src";
import { ZapBondage } from "@zapjs/bondage/lib/src";
import { ZapProvider } from "@zapjs/provider/lib/src";
import { loadProvider, loadSubscriber, getProviderEndpointInfo } from "../utils";
import { showLoading, showError, hideMessage } from "../store/actions";
import {CurveLineChart} from 'zap-curve-chart';
import { Curve } from "@zapjs/curve/lib/src";
import * as marked from 'marked';

class Provider {

  private _disabled = false;

  private bondage: ZapBondage;
  private registry: ZapRegistry;
  private subscriber: ZapSubscriber;
  private provider: ZapProvider;
  private endpointInfo: {curve: Curve, dotsIssued, zapBound, endpointMd: string, endpointJson: string};

  private chart: CurveLineChart;
  private markdown: HTMLDivElement;

  private zap: HTMLDivElement;
  private eth: HTMLDivElement;
  private boundDots: HTMLDivElement;

  private providerName: HTMLDivElement;
  private endpointName: HTMLDivElement;

  private dotsIssued: HTMLDivElement;
  private zapBound: HTMLDivElement;
  private nextDotPrice: HTMLDivElement;
  private curveValues: HTMLDivElement;
  private curveString: HTMLDivElement;

  private bondForm: HTMLFormElement;
  private bondDotsInput: HTMLInputElement;
  private bondDotsPrice: HTMLDivElement;

  private el: HTMLDivElement;

  constructor(
    private container: HTMLElement,
    private web3,
    private address,
    private providerAddress,
    private endpoint,
    private dispatch: (e: any) => void
  ) {
    this.handleDotsChange = this.handleDotsChange.bind(this);
    this.handleBondDotsSubmit = this.handleBondDotsSubmit.bind(this);
    this.el = document.createElement('div');
    this.el.className = 'provider';

    this.zap = this.el.appendChild(document.createElement('div'));
    this.zap.className = 'zap';
    this.eth = this.el.appendChild(document.createElement('div'));
    this.eth.className = 'eth';
    this.boundDots = this.el.appendChild(document.createElement('div'));
    this.boundDots.className = 'bound-dots';

    this.providerName = this.el.appendChild(document.createElement('div'));
    this.providerName.className = 'provider-name';
    this.endpointName = this.el.appendChild(document.createElement('div'));
    this.endpointName.className = 'endpoint-name';

    this.dotsIssued = this.el.appendChild(document.createElement('div'));
    this.dotsIssued.className = 'dots-issued';
    this.zapBound = this.el.appendChild(document.createElement('div'));
    this.zapBound.className = 'zap-bound';
    this.nextDotPrice = this.el.appendChild(document.createElement('div'));
    this.nextDotPrice.className = 'next-dot-price';

    this.makeBondForm();

    const divChart = this.el.appendChild(document.createElement('div'));
    divChart.className = 'curve-chart';
    this.markdown = this.el.appendChild(document.createElement('div'));
    this.markdown.className = 'markdown-body';
    this.chart = new CurveLineChart(divChart);

    container.appendChild(this.el);

    this.initialize().catch(e => {
      console.log(e);
      this.dispatch(showError(e.message));
    });
  }

  private async initialize() {
    this.dispatch(showLoading('Loading provider'));
    const options = { networkId: (await this.web3.eth.net.getId()).toString(), networkProvider: this.web3.currentProvider };
    this.registry = new ZapRegistry(options);
    this.bondage = new ZapBondage(options);
    this.dispatch(showLoading('Loading subscriber'));
    const [subscriber, provider] = await Promise.all([loadSubscriber(this.web3, this.address), loadProvider(this.web3, this.providerAddress)]);
    this.subscriber = subscriber;
    this.provider = provider;
    await this.provider.getTitle();
    return Promise.all([
      this.updateSubscriberInfo(),
      this.updateEndpointInfo(),
    ]);
  }

  private handleDotsChange(e) {
    const dots = Number(e.target.value);
    const dotsIssued = Number(this.endpointInfo.dotsIssued);
    try {
      this.bondDotsPrice.textContent = this.endpointInfo.curve.getZapRequired(dotsIssued, dots).toString();
    } catch (e) {
      console.log(e);
      this.bondDotsInput.value = this.endpointInfo.curve.max.toString();
      this.bondDotsPrice.textContent = this.endpointInfo.curve.getZapRequired(dotsIssued, this.endpointInfo.curve.max - dotsIssued).toString();
    }
  }

  private async handleBondDotsSubmit(e) {
    e.preventDefault();
    const dots = Number(this.bondForm.dots.value);
    this.dispatch(showLoading('Bonding ...'));
    try {
      await this.subscriber.bond({provider: this.providerAddress, endpoint: this.endpoint, dots});
      await Promise.all([
        this.updateEndpointInfo(),
        this.updateSubscriberInfo(),
      ]);
      this.bondDotsInput.value = '1';
      this.bondDotsInput.dispatchEvent(new Event('change'));
    } catch (e) {
      console.log(e);
      this.dispatch(showError(e.message));
    }
  }

  makeBondForm() {
    this.bondForm = document.createElement('form');
    this.bondDotsInput = this.bondForm.appendChild(document.createElement('input'));
    this.bondDotsInput.type = 'number';
    this.bondDotsInput.name = 'dots';
    this.bondDotsInput.min = '1';
    this.bondDotsInput.addEventListener('change', this.handleDotsChange);
    this.bondForm.addEventListener('submit', this.handleBondDotsSubmit);
    this.bondDotsPrice = this.bondForm.appendChild(document.createElement('div'));
    const button = this.bondForm.appendChild(document.createElement('button'));
    button.type = 'submit';
    button.textContent = 'Bond';
    this.bondDotsInput.value = '1';
    this.el.appendChild(this.bondForm);
  }

  private async updateEndpointInfo() {
    this.dispatch(showLoading('Loading endpoint info'));
    const endpointInfo = await getProviderEndpointInfo(this.provider, this.endpoint);
    this.dispatch(hideMessage());
    this.chart.draw(endpointInfo.curve.values, Number(endpointInfo.dotsIssued));
    this.providerName.textContent = this.provider.title;
    this.endpointName.textContent = this.endpoint;

    this.dotsIssued.textContent = endpointInfo.dotsIssued.toString();
    this.zapBound.textContent = endpointInfo.zapBound.toString();
    this.nextDotPrice.textContent = endpointInfo.curve.getPrice(Number(endpointInfo.dotsIssued) + 1).toString();

    if (endpointInfo.endpointMd && (!this.endpointInfo || endpointInfo.endpointMd !== this.endpointInfo.endpointMd)) {
      this.markdown.innerHTML = marked(endpointInfo.endpointMd);
    }
    this.endpointInfo = endpointInfo;
    this.bondDotsInput.max = this.endpointInfo.curve.max.toString();
    this.bondDotsInput.dispatchEvent(new Event('change'));
  }

  private async updateSubscriberInfo() {
    const [eth, zap, boundDots] = await Promise.all([
      this.web3.eth.getBalance(this.address),
      this.subscriber.getZapBalance(),
      this.subscriber.getBoundDots({provider: this.providerAddress, endpoint: this.endpoint}),
    ]);
    this.zap.textContent = zap.toString();
    this.eth.textContent = eth.toString();
    this.boundDots.textContent = boundDots.toString();
  }

  set disabled(disabled) {
    if (this._disabled === disabled) return;
    this._disabled = disabled;
    this.bondDotsInput.disabled = disabled;
    this.bondForm.getElementsByTagName('button')[0].disabled = disabled;
  }

  destroy() {
    this.chart.destroy();
    this.bondDotsInput.removeEventListener('change', this.handleDotsChange);
    this.bondForm.removeEventListener('submit', this.handleBondDotsSubmit);
    this.container.removeChild(this.el);
  }
}

export function createProvider(container: HTMLElement, store) {
  let prevView = null;
  let provider: Provider = null;
  return store.subscribe(() => {
    const { view, web3, address, loading, endpoint, providerAddress } = store.getState() as State;
    if (provider) provider.disabled = loading;
    if (prevView === view) return;
    prevView = view;
    if (provider) {
      provider.destroy();
      provider = null;
    }
    if (view === VIEW.PROVIDER) {
      provider = new Provider(container, web3, address, providerAddress, endpoint, store.dispatch);
    }
  });
}