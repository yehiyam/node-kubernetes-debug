import { KubeConfig } from './config';
export interface WatchUpdate {
    type: string;
    object: object;
}
export declare class Watch {
    'config': KubeConfig;
    constructor(config: KubeConfig);
    watch(path: string, queryParams: any, callback: (phase: string, obj: any) => void, done: (err: any) => void): any;
}
