import { Curve } from '@zapjs/curve';
export declare class Chart {
    private container;
    private el;
    private chartEl;
    private chart;
    private curveValues;
    private curveString;
    private _curve;
    private _dotsIssued;
    private updateScheduled;
    constructor(container: HTMLElement);
    dotsIssued: any;
    curve: Curve;
    update(): void;
    private static curveToString;
    destroy(): void;
}
