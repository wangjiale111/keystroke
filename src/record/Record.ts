import { UserViewModel } from './DomEventRecord';
import $ from 'jquery';
import Papa from "papaparse";
import  {ElMessageBox} from 'element-plus';

export default class EventRecord {

    userEventLog = [];
    userViewModelLog:any[] = [];
    ctrlKeyDown = false;
    index = 1;
    count = 1;
    interval = 10; // 时间间隔为 10 毫秒

    startTimeDelay = 0;
    isPaused=  1;
    currentInputValue: string;

    constructor(progressCall:any) {
        // this.startTimeDelay = new Date().getTime();
        this.progressCall = progressCall;
        this.currentInputValue = '';
        // document.addEventListener('click', (event) => { this.logEvent(event); }, true);
        // document.addEventListener('mousedown', (event) => { this.logEvent(event); }, true);
        // document.addEventListener('mousemove', (event) => { this.logEvent(event); }, true);
        // document.addEventListener('mouseup', (event) => {
        //
        //     this.logEvent(event);
        //
        //     // if the user has selected text, then we want to record an extra 'contains' event. on playback, this is used
        //     // to verify that the selected text is contained within the target element
        //     const selectedText = this._getSelectionText();
        //     if (selectedText.length > 1) {
        //         this.logEvent({ 'target':document.activeElement, 'type':'contains', 'text':selectedText, 'timeStamp':event.timeStamp });
        //     }
        // }, true);
        // 添加监听器
        // setInterval(() => {
        //     if (this.isPaused) {
        //         this.userEventLog.push(
        //             // {
        //             //     'timeStamp':
        //             //     'inputType': 'pause',
        //             //     'index': this.index++
        //             // }
        //         {
        //             "selector": "",
        //             "isTrusted": true,
        //             "value": this.userEventLog.length ? this.userEventLog[this.userEventLog.length - 1]['value'] : "",
        //             "data": "",
        //             "isComposing": false,
        //             "inputType": "pause",
        //             "detail": 0,
        //             "which": 0,
        //             "type": "input",
        //             "eventPhase": 1,
        //             "bubbles": true,
        //             "cancelable": false,
        //             "defaultPrevented": false,
        //             "composed": true,
        //             "timeStamp":  new Date().getTime() - this.startTimeDelay,
        //             "returnValue": true,
        //             "cancelBubble": false
        //         }
        //         )
        //     } else {
        //         this.isPaused = 1;
        //     }
        // }, 10);
        let lastEventTimestamp = 0; // 记录上一个事件的时间戳

        document.addEventListener('input', (event) => {
            const currentTimestamp = event.timeStamp || Date.now(); // 获取当前事件的时间戳
            if (currentTimestamp - lastEventTimestamp > 10) { // 如果与上一个事件的时间差大于一定值（如10毫秒），则处理事件
                this.logEvent($.extend(true, event, { 'value':$((event as any).target).val() }));
                lastEventTimestamp = currentTimestamp; // 更新上一个事件的时间戳
            }
        }, true);

        // document.addEventListener('focus', (event)=> { this.logEvent(event); }, true);
        // document.addEventListener('focusin', (event)=> { this.logEvent(event); }, true);
        // document.addEventListener('focusout', (event)=> { this.logEvent(event); }, true);
        // document.addEventListener('blur', (event)=> { this.logEvent(event);}, true);
        // document.addEventListener('keypress', (event)=> { this.logEvent(event); }, true);
        // document.addEventListener('keydown', (event)=> { this.logEvent(event); }, true);
        // document.addEventListener('keyup', (event)=> { this.logEvent(event); }, true);
        // document.addEventListener('touchstart', (event)=> {  this.logEvent(event); }, true);
        // document.addEventListener('touchend', (event)=> { this.logEvent(event); }, true);
        // document.addEventListener('touchmove', (event)=> { this.logEvent(event); }, true);
        // document.addEventListener('touchcancel', (event)=> { this.logEvent(event); }, true);
        // document.addEventListener('scroll', (event)=> { this.logEvent(event); }, true);

    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    progressCall:Function;

    recordViewModel(viewModel:UserViewModel, startTime:any, orderNo:any) {
        if(startTime !== 0 && this.count == 1) {
            this.startTimeDelay = startTime;
            this.index = orderNo;
            this.count = 0;
        }
        viewModel.timeStamp = new Date().getTime() - this.startTimeDelay;
        viewModel.index = ++this.index;
        this.userViewModelLog.push(viewModel);
        return viewModel;
    }

    _getSelectionText = () => {
        let text = '';
        const activeEl = document.activeElement;
        const activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if ((activeElTagName == 'textarea') || (activeElTagName == 'input' &&  /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) &&  (typeof activeEl.selectionStart == 'number')
        ) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
        } else if (window.getSelection) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            text = window.getSelection().toString();
        }
        return text;
    };

    /*	Function: logEvent
            This function will parse the

    */
    logEvent = (event: any) => {

        // Only record the event if recording is in progress
        if ((window as any).recordInProgress == true) {

            const userEvent = { 'selector': this.getSelector(event.target) } as any;

            if (event.type === 'scroll') {
                userEvent.type = 'scroll';
                userEvent.scrollTop = $(event.target).scrollTop();
                userEvent.scrollLeft = $(event.target).scrollLeft();
                userEvent.timeStamp = event.timeStamp;
            }
            if (event.type === 'keypress' || event.type === 'keyup') {
                userEvent.value = event.target.value;
            }
            else {
                for (const prop in event) {
                    // We can only record plain such as string, numbers and booleans in JSON. Objects will require special processing.
                    if (['number', 'string', 'boolean'].indexOf(typeof event[prop]) > -1
                        // Exclude certain event event attributes in order to keep the JSON log as small as possible.
                        // These attributes are not needed to re-create the event during playback.
                        && ['AT_TARGET', 'BUBBLING_PHASE', 'CAPTURING_PHASE', 'NONE', 'DOM_KEY_LOCATION_STANDARD', 'DOM_KEY_LOCATION_LEFT', 'DOM_KEY_LOCATION_RIGHT', 'DOM_KEY_LOCATION_NUMPAD'].indexOf(prop) == -1) {
                        userEvent[prop] = event[prop];
                    } else if (['touches', 'changedTouches'].indexOf(prop) > -1) {

                        userEvent[prop] = [];

                        for (let i = 0; i < event[prop].length; i++) {
                            const touch = event[prop][i];
                            userEvent[prop].push({
                                'clientX':touch.clientX
                                , 'clientY':touch.clientY
                                , 'force':touch.force
                                , 'identifier':touch.identifier
                                , 'pageX':touch.pageX
                                , 'pageY':touch.pageY
                                , 'radiusX':touch.radiusX
                                , 'radiusY':touch.radiusY
                                , 'rotationAngle':touch.rotationAngle
                                , 'screenX':touch.screenX
                                , 'screenY':touch.screenY
                                , 'selector':this.getSelector(touch.target)
                            });

                        }

                    }
                }
            }

            if (event.type === 'input') {
                const inputValue = event.target.value;
                // console.log(inputValue, this.currentInputValue);
                if (inputValue.length < this.currentInputValue.length) {
                    userEvent.value = inputValue;
                    userEvent.keyValue = 'delete'; // 最后一个按键的值
                    this.currentInputValue = inputValue;
                } else {
                    if (inputValue !== this.currentInputValue) {
                        userEvent.value = inputValue;
                        userEvent.keyValue = inputValue[inputValue.length - 1]; // 最后一个按键的值
                        this.currentInputValue = inputValue;
                    }
                }
            }

            // Subtract the start time delay from the timestamp so we don't include the dead time (i.e., time between
            // page load and recording started) in our playback JSON log.
            // userEvent.timeStamp = userEvent.timeStamp - this.startTimeDelay;
            userEvent.timeStamp = Math.floor((new Date().getTime() - this.startTimeDelay) / 10) * 10; // 更改为10毫秒精度
            if (userEvent.selector !== null) {
                if ((window as any).playbackInProgress == false) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    this.userEventLog.push(userEvent);
                    if(this.progressCall) {
                        this.progressCall(userEvent);
                    }
                    // console.debug('Logged ' + userEvent.type + ' event.');
                }
            } else {
                console.warn('Null selector');
            }
        }
    };

    getUserEventLog = () => {
        return this.userEventLog;
    }

    getUserViewModelLog = () => {
        return this.userViewModelLog;
    }

    getSelector = (el:any, names?:any) => {
        if (el === document || el === document.documentElement) return 'document';
        if (el === document.body) return 'body';
        if (typeof names === 'undefined')  names = [];
        if (el.id) {
            names.unshift('#' + el.id);
            return names.join(' > ');
        } else if (el.className) {
            const arrNode = [].slice.call(el.parentNode.getElementsByClassName(el.className));
            const classSelector = el.className.split(' ').join('.');
            if (arrNode.length == 1) {
                names.unshift(el.tagName.toLowerCase() + '.' + classSelector);
            } else {
                for (let c = 1, e = el;e.previousElementSibling;e = e.previousElementSibling, c++)
                names.unshift(el.tagName.toLowerCase() + ':nth-child(' + c + ')');
            }
        } else {
            for (let c = 1, e = el;e.previousElementSibling;e = e.previousElementSibling, c++)
            names.unshift(el.tagName.toLowerCase() + ':nth-child(' + c + ')');
        }

        if (el.parentNode !== document.body) {
            this.getSelector(el.parentNode, names);
        }
        return names.join(' > ');
    };

    start = () => {
        if ((window as any).playbackInProgress == false) {
            this.startTimeDelay = new Date().getTime();
            console.debug('Start recording.');

            // this.startTimeDelay = Math.abs(this.startTimeDelay - new Date().getTime());
            (window as any).recordInProgress = true;

        } else {
            throw new Error('Cannot start recording -- test playback is in progress.');
        }
    }

    stop = () => {
        console.debug('Stop recording.');

        (window as any).recordInProgress = false;

        const playbackScript = {
            'window': { 'width': window.innerWidth, 'height': window.innerHeight },
            'event_log': this.userEventLog
        };
        console.log(this.userEventLog)
        ElMessageBox.confirm("是否生成CSV?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
        })
            .then(() => {
                // 将数据转换为CSV格式
                const csv = Papa.unparse(this.userEventLog);
                const csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const csvURL = window.URL.createObjectURL(csvData);
                const tempLink = document.createElement("a");
                tempLink.href = csvURL;
                tempLink.setAttribute("download", "writingData.csv");
                document.body.appendChild(tempLink);
                tempLink.click();
                document.body.removeChild(tempLink);
            })
            .catch(() => {
                // 取消
            });


        return playbackScript;
    }


}
