import { ViewModelPlayBack } from './ViewModelPlayBack';
// import { PlayBack } from './PlayBack';
import EventRecord from './Record';
import mitt from '@/record/emmit';

export interface UserEvent{
    'selector': string,
    'isTrusted': boolean,
    'screenX': number,
    'screenY': number,
    'clientX': number,
    'clientY': number,
    'ctrlKey': boolean,
    'shiftKey': boolean,
    'altKey': boolean,
    'metaKey': boolean,
    'button': number,
    'buttons': number,
    'pageX': number,
    'pageY': number,
    'x': number,
    'y': number,
    'offsetX': number,
    'offsetY': number,
    'movementX': number,
    'movementY': number,
    'layerX': number,
    'layerY': number,
    'detail': number,
    'which': number,
    'type': string,
    'eventPhase': number,
    'bubbles': boolean,
    'cancelable': boolean,
    'defaultPrevented': boolean,
    'composed': boolean,
    'timeStamp': number,
    'returnValue': boolean,
    'cancelBubble': boolean,
    'scrollLeft': number,
    'scrollTop': number,

    'touches': Touch[],
    'changedTouches': Touch[],
  /*  "force":number
    "identifier":number
    "radiusX":number
    "radiusY":number
    "rotationAngle":number*/
    'target':any,
    'text': string,
    'value': string

}

export interface UserViewModel {
    classKey: string;

    modelValue: any;
    // 时间戳
    timeStamp?: number;
    index?:number;
}

export class DomEventRecord {

    record!: EventRecord;
    // playback!: PlayBack;
    viewModelPlayBack!: ViewModelPlayBack;

    constructor() {
        (window as any).emitter = mitt();
        (window as any).playbackInProgress = false;
        (window as any).recordInProgress = false;
    }

    /**
     * 
     * @param progressCall 实时录制的回调函数，会把EventLog返回，
     */
    startRecord(progressCall:any) {
        this.record = new EventRecord(progressCall);

        this.record.start();
    }

    /**
     * 记录用户vm 数据
     * @param userData 开始录制后的vue vm数据
     */
    recordUserViewModel(userData: UserViewModel, startTime: any, orderNo:any) {
        // if(!this.record) return;
        return this.record.recordViewModel(userData, startTime, orderNo);
    }

    // /**
    //  * 获取录制log数据
    //  * @returns eventLog
    //  */
    // getRecordLog() {
    //     return this.record.getUserEventLog();
    // }

    // /**
    //  * 获取用户vm数组
    //  * @returns 返回ViewModal 数据数据
    //  */
    // getRecordViewModal() {
    //     return this.record.getUserViewModelLog();
    // }

    /**
     * 停止录制并返回录制数据
     * @returns 返回所有EventLog 数组
     */
    stopRecord(p: (log: any) => void) {
        return this.record.stop();
    }

    /**
     * 开始回放
     * @param data 全量EventLog录制的数据
     */
    // startPlayback(data:any) {
    //    this.playback = new PlayBack(data);
    //    this.playback.start();
    // }

    startViewModelPlayback(data:any,  finish?:any) {
        this.viewModelPlayBack = new ViewModelPlayBack(data);
        if(finish && typeof finish == 'function'){
            this.viewModelPlayBack.start(finish);
        }
        else this.viewModelPlayBack.start();
        return this.viewModelPlayBack;
    }
   async stopViewModelPlayback(data:ViewModelPlayBack) {
        data.stop();
    }
}
