import { State, Message } from "./store/reducers";
import { Store } from "redux";

export function createMessage(container: HTMLElement, store: Store) {
  let state: Message = null;
  const message = document.createElement('div');
  message.className = 'message';
  container.appendChild(message);
  return store.subscribe(() => {
    const newState = (store.getState() as State).message;
    if (state === newState) return;
    state = newState;
    message.className = 'message ' + (state ? state.type : '');
    message.textContent = state ? state.text : '';
  });
}