export declare class MnemonicLogin {
    private container;
    private setProvider;
    private dispatch;
    private el;
    private button;
    private select;
    private input;
    private message;
    private close;
    constructor(container: HTMLElement, setProvider: (e: any) => void, dispatch: (e: any) => void);
    disabled: any;
    handleClose(e: any): void;
    handleSubmit(e: any): Promise<void>;
    destroy(): void;
}
