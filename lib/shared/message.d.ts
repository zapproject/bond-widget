import { Message } from '../store/reducers';
export declare class MessageElement {
    private container;
    private el;
    private _message;
    private className;
    constructor(container: HTMLElement);
    message: Message;
    destroy(): void;
}
