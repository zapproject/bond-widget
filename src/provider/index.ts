import { State, VIEW, Widget, UserInfo, MESSAGE_TYPE } from "../store/reducers";
import { Chart } from './chart';
import { BondForm } from './bond-form';
import { EndpointInfo } from './endpoint-info';
import { EndpointMarkdown } from './endpoint-markdown';
import { MessageElement } from '../shared/message';
import { UserInfoElement } from '../shared/user-info';
import { select } from "../store";

export class Provider {

  unsubscribe = [];

  private el: HTMLDivElement;

  private _widget: Widget = null;
  private _userInfo: UserInfo = null;

  private bondForm: BondForm;
  private chart: Chart;
  private endpointInfo: EndpointInfo;
  private endpointMarkdown: EndpointMarkdown;
  private message: MessageElement;
  private userInfoElement: UserInfoElement;
  private widgetID

  constructor(
    private container: HTMLElement,
    private providerAddress,
    private endpoint,
    private store,
  ) {
    this.updateWidget = this.updateWidget.bind(this);
    this.updateUserInfo = this.updateUserInfo.bind(this);
    this.widgetID = this.providerAddress + this.endpoint;

    this.el = document.createElement('div');
    this.el.className = 'provider';

    this.message = new MessageElement(this.el);
    this.userInfoElement = new UserInfoElement(this.el, this.widgetID);
    this.endpointInfo = new EndpointInfo(this.el);
    this.bondForm = new BondForm(this.el, this.endpoint, this.providerAddress, this.widgetID, this.store.dispatch);
    this.chart = new Chart(this.el);
    this.endpointMarkdown = new EndpointMarkdown(this.el);
    this.unsubscribe.push(store.subscribe(select(state => state.widgets.find(widget => widget.id === this.widgetID), this.updateWidget, store.getState())));
    this.unsubscribe.push(store.subscribe(select(state => state.userInfo, this.updateUserInfo, store.getState())));
    container.appendChild(this.el);
  }


  private get loading() {
    return this._widget.message && this._widget.message.type === MESSAGE_TYPE.LOADIG;
  }

  updateWidget(widget: Widget) {
    console.log('updateWidget', this.widgetID);
    this._widget = widget;
    if (!this._widget) return;
    this.chart.curve = this._widget.curve;
    this.chart.dotsIssued = this._widget.dotsIssued;
    this.endpointInfo.dots = this._widget.dotsIssued;
    this.endpointInfo.endpoint = this._widget.endpoint;
    this.endpointInfo.provider = this._widget.provider;
    this.endpointMarkdown.markdown = this._widget.endpointMd;
    this.bondForm.curve = this._widget.curve;
    this.bondForm.dotsIssued = this._widget.dotsIssued;
    this.bondForm.disabled = this.loading;
    this.message.message = this._widget.message;
  }

  updateUserInfo(userInfo: UserInfo) {
    this._userInfo = userInfo;
    this.bondForm.subscriber = this._userInfo ? this._userInfo.subscriber : null;
    this.userInfoElement.userInfo = this._userInfo;
  }

  destroy() {
    this.unsubscribe.forEach(e => { e(); });
    this.userInfoElement.destroy();
    this.message.destroy();
    this.chart.destroy();
    this.endpointInfo.destroy();
    this.endpointMarkdown.destroy();
    this.bondForm.destroy();
    this.container.removeChild(this.el);
  }
}
