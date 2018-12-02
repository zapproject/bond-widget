import { ZapBondWidget } from './index';

const widget = new ZapBondWidget();
widget.init('.zap-bond-widget');

/* class CounterStore {
  _subscribers = [];
  state = 0;
  reducer = () => {
    this.state += 1;
  }

  subscribe
}

import * as Flux from 'flux';
import { Dispatcher } from 'flux';

console.log('Flux', Flux);

const reducer = (action) => {
  console.log('reducer  action', action);
}
const reducer2 = (action) => {
  console.log('reducer2 action', action);
}

const dispatcher = new Dispatcher();

console.log('dispatcher', dispatcher);

dispatcher.register(reducer);
dispatcher.register(reducer2);

dispatcher.dispatch({ type: 'city-update', payload: 'paris' }); */