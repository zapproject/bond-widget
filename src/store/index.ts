export function combineReducers(reducers) {
  const initState = {};
  const finalReducers = Object.keys(reducers).map((key) => {
    const reducer = reducers[key];
    initState[key] = reducers[key](undefined, { type: null });
    return { key, reducer };
  });
  return (state = initState, action) => {
    const newState = {};
    let changed = false;
    let i = finalReducers.length;
    while (i--) {
      const { key, reducer } = finalReducers[i];
      const prevState = state[key];
      const nextState = reducer(prevState, action);
      if (!changed && prevState !== nextState) changed = true;
      newState[key] = nextState;
    }
    return changed ? newState : state;
  };
}

export function Store(reducer) {
  let state = reducer(undefined, { type: null });
  const subscribers = [];
  function notifySubscribers() {
    let i = subscribers.length;
    while (i--) {
      const { callback, select, prevValue } = subscribers[i];
      if (!select) {
        callback(state);
        continue;
      }
      const value = select(state);
      if (prevValue === value) continue;
      subscribers[i].prevValue = value;
      callback(value);
    }
  }
  function reduce(action) {
    if (!action || !action.type) return;
    const newState = reducer(state, action);
    if (state === newState) return;
    state = newState;
    notifySubscribers();
  }
  this.getState = () => state;
  this.dispatch = (action) => {
    if (typeof action === 'function') {
      action(this.dispatch, this.getState);
    } else {
      reduce(action);
    }
  };
  this.subscribe = (callback, select = null) => {
    const prevValue = select ? select(state) : null;
    subscribers.push({ callback, select, prevValue });
    return () => {
      let i = subscribers.length;
      while (i--) {
        if (subscribers[i].callback !== callback) continue;
        subscribers.splice(i, 1);
        break;
      }
    };
  };
}