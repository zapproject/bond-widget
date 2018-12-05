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

export function select(selector, callback, initState = null, checkEqual = (value, prevValue) => value === prevValue) {
  let prevValue = initState ? selector(initState) : null;
  return state => {
    const value = selector(state);
    if (checkEqual(value, prevValue)) return;
    prevValue = value;
    callback(value);
  }
}

export function Store(reducer) {
  let state = reducer(undefined, { type: null });
  const subscribers = [];
  function notifySubscribers() {
    let i = subscribers.length;
    while (i--) subscribers[i](state);
  }
  function reduce(action = {type: null}) {
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
  this.subscribe = (callback) => {
    subscribers.push(callback);
    return () => {
      const i = subscribers.indexOf(callback);
      if (i !== -1) subscribers.splice(i, 1);
    };
  };
}