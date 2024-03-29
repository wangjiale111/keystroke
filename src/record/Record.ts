import {UserViewModel} from './DomEventRecord';
import $ from 'jquery';

export default class EventRecord {

    userEventLog = [];
    userViewModelLog: any[] = [];
    ctrlKeyDown = false;
    index = 1;
    count = 1;
    interval = 10; // 时间间隔为 10 毫秒

    startTimeDelay = 0;
    isPaused = 1;
    currentInputValue: string;
    keyCode: any;
    textIndex = 1;

    constructor(progressCall: any) {
        // this.startTimeDelay = new Date().getTime();
        this.progressCall = progressCall;
        this.currentInputValue = '';

        let lastEventTimestamp = 0; // 记录上一个事件的时间戳

        document.addEventListener('keydown', (event) => {
            this.keyCode = event.key; // 记录最近按下的键值
            // console.log("keydown "+this.keyCode);
        }, true);
        document.addEventListener('input', (event) => {
            // console.log("input "+this.keyCode);
            const currentTimestamp = event.timeStamp || Date.now(); // 获取当前事件的时间戳
            if (currentTimestamp - lastEventTimestamp > 10) { // 如果与上一个事件的时间差大于一定值（如10毫秒），则处理事件
                this.logEvent($.extend(true, event, {'value': $((event as any).target).val()}));
                lastEventTimestamp = currentTimestamp; // 更新上一个事件的时间戳
            }
        }, true);

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

        // document.addEventListener('focus', (event)=> { this.logEvent(event); }, true);
        // document.addEventListener('focusin', (event)=> { this.logEvent(event); }, true);
        // document.addEventListener('focusout', (event)=> { this.logEvent(event); }, true);
        // document.addEventListener('blur', (event)=> { this.logEvent(event);}, true);
        // document.addEventListener('keypress', (event)=> { this.logEvent(event); }, true);
        // document.addEventListener('keydown', (event)=> {
        //     this.logEvent(event);
        // }, true);
        // document.addEventListener('keyup', (event)=> { this.logEvent(event); }, true);
        // document.addEventListener('touchstart', (event)=> {  this.logEvent(event); }, true);
        // document.addEventListener('touchend', (event)=> { this.logEvent(event); }, true);
        // document.addEventListener('touchmove', (event)=> { this.logEvent(event); }, true);
        // document.addEventListener('touchcancel', (event)=> { this.logEvent(event); }, true);
        // document.addEventListener('scroll', (event)=> { this.logEvent(event); }, true);

    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    progressCall: Function;

    recordViewModel(viewModel: UserViewModel, startTime: any, orderNo: any) {
        if (startTime !== 0 && this.count == 1) {
            this.startTimeDelay = startTime;
            this.index = orderNo;
            this.count = 0;
        }
        viewModel.timeStamp = new Date().getTime() - this.startTimeDelay;
        viewModel.index = this.index++;
        this.userViewModelLog.push(viewModel);
        return viewModel;
    }

    _getSelectionText = () => {
        let text = '';
        const activeEl = document.activeElement;
        const activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if ((activeElTagName == 'textarea') || (activeElTagName == 'input' && /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) && (typeof activeEl.selectionStart == 'number')
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

    // isChineseCharacter = (temp: any) => {
    //     const re = /[^\u4e00-\u9fa5]/;
    //     if (re.test(temp)) {
    //         return false;
    //     }
    //     return true;
    // }

    /*	Function: logEvent
            This function will parse the

    */
    // 分析logEvent功能：
    logEvent = (event: any) => {

        function isChineseCharacter(inputValueElement: any) {
            const re = /[^\u4e00-\u9fa5]/;
            if (re.test(inputValueElement)) {
                return false;
            }
            return true;
        }

        // Only record the event if recording is in progress
        const userEvent = {'selector': this.getSelector(event.target)} as any;
        // textPosition为鼠标光标所在的位置
        userEvent.textPosition = event.target.selectionStart;
        if (event.type === 'scroll') {
            userEvent.type = 'scroll';
            userEvent.scrollTop = $(event.target).scrollTop();
            userEvent.scrollLeft = $(event.target).scrollLeft();
            userEvent.timeStamp = event.timeStamp;
        }
        if (event.type === 'keypress' || event.type === 'keyup') {
            userEvent.value = event.target.value;
        } else {
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
                            'clientX': touch.clientX
                            , 'clientY': touch.clientY
                            , 'force': touch.force
                            , 'identifier': touch.identifier
                            , 'pageX': touch.pageX
                            , 'pageY': touch.pageY
                            , 'radiusX': touch.radiusX
                            , 'radiusY': touch.radiusY
                            , 'rotationAngle': touch.rotationAngle
                            , 'screenX': touch.screenX
                            , 'screenY': touch.screenY
                            , 'selector': this.getSelector(touch.target)
                        });

                    }

                }
            }
        }
        if (event.type === 'input') {
            userEvent.No = this.textIndex++;

            if (userEvent.inputType === "deleteContentBackward") {
                userEvent.inputType = "delete";
            } else if (userEvent.inputType === "insertLineBreak") {
                userEvent.inputType = "insertText"
            }

            // 去除缓冲区标点符号replace(/[^\w\s]/g, "");
            userEvent.data = userEvent.data ? userEvent.data.replace(/[^\w\s]/g, "") : null;
            // 获得当前输入法缓冲区的长度
            userEvent.IMEBuffer_length = event.target.value.replace(/[^a-zA-Z]/g, '').length;
            // 获取当前中文输入的长度
            userEvent.ChineseLength = event.target.value.match(/[\u4e00-\u9fff]/g) ? event.target.value.match(/[\u4e00-\u9fff]/g).length : 0;
            // 总长度
            userEvent.textLength = event.target.value.length;
            // 获取中文文本
            userEvent.ChineseText = event.target.value.replace(/[a-zA-Z]/g, "");
            // 添加一个判断，若this.keyCode为Enter或者为空格键则直接赋值给keyValue
            if (this.keyCode === 'Enter') {
                userEvent.keyValue = this.keyCode;
            } else if (this.keyCode === ' ') {
                userEvent.keyValue = "Space"
            } else {
                const inputValue = event.target.value;
                if (this.currentInputValue.length - inputValue.length == 1 && !isChineseCharacter(userEvent.data)) {
                    userEvent.value = inputValue;
                    userEvent.keyValue = 'Backspace';
                    if (userEvent.IMEBuffer_length >= 0 && userEvent.inputType != "delete") {
                        userEvent.inputType = 'deleteIME'
                    }
                    this.currentInputValue = inputValue;
                } else {
                    if (inputValue !== this.currentInputValue) {
                        userEvent.value = inputValue;
                        if (isChineseCharacter(inputValue[inputValue.length - 1]) || isChineseCharacter(userEvent.data[userEvent.data.length - 1])) {
                            userEvent.keyValue = 'Space';
                        } else {
                            if (userEvent.data) {
                                userEvent.keyValue = userEvent.data[userEvent.data.length - 1];
                            } else {
                                userEvent.keyValue = inputValue[inputValue.length - 1];
                            }
                        }
                        this.currentInputValue = inputValue;
                    }
                }
            }
            if (userEvent.inputType === "insertCompositionText") {
                if (/^[a-zA-Z]$/.test(userEvent.keyValue)) {
                    userEvent.inputType = "insertChineseText"
                } else {
                    userEvent.inputType = "insertText"
                }
            }
        }
        userEvent.timeStamp = Math.floor((new Date().getTime() - this.startTimeDelay) / 10) * 10;
        if (userEvent.selector !== null) {
            const {
                No,
                selector,
                value,
                ChineseText,
                data,
                ChineseLength,
                IMEBuffer_length,
                textLength,
                keyValue,
                inputType,
                textPosition,
                timeStamp
            } = userEvent;
            const simplifiedUserEvent = {
                index: No,
                classKey: selector,
                text: value,
                ChineseText,
                IMEBuffer: data,
                ChineseLength,
                IMEBuffer_length,
                textLength,
                keyValue,
                keyAction: inputType,
                textPosition,
                timeStamp,
            };
            this.userEventLog.push(simplifiedUserEvent);
            if (this.progressCall) {
                this.progressCall(simplifiedUserEvent);
            }
        } else {
            console.warn('Null selector');
        }
    };

    getUserEventLog = () => {
        return this.userEventLog;
    }

    getUserViewModelLog = () => {
        return this.userViewModelLog;
    }

    getSelector = (el: any, names?: any) => {
        if (el === document || el === document.documentElement) return 'document';
        if (el === document.body) return 'body';
        if (typeof names === 'undefined') names = [];
        if (el.id) {
            names.unshift('#' + el.id);
            return names.join(' > ');
        } else if (el.className) {
            const arrNode = [].slice.call(el.parentNode.getElementsByClassName(el.className));
            const classSelector = el.className.split(' ').join('.');
            if (arrNode.length == 1) {
                names.unshift(el.tagName.toLowerCase() + '.' + classSelector);
            } else {
                for (let c = 1, e = el; e.previousElementSibling; e = e.previousElementSibling, c++)
                    names.unshift(el.tagName.toLowerCase() + ':nth-child(' + c + ')');
            }
        } else {
            for (let c = 1, e = el; e.previousElementSibling; e = e.previousElementSibling, c++)
                names.unshift(el.tagName.toLowerCase() + ':nth-child(' + c + ')');
        }

        if (el.parentNode !== document.body) {
            this.getSelector(el.parentNode, names);
        }
        return names.join(' > ');
    };

    start = () => {
        this.startTimeDelay = new Date().getTime();
        console.debug('Start recording.');
    }

    stop = () => {
        console.debug('Stop recording.');
        const playbackScript = {
            'window': {'width': window.innerWidth, 'height': window.innerHeight},
            'event_log': this.userEventLog
        };
        return playbackScript;
    }


}
