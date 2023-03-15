import $ from 'jquery';
import { UserEvent } from './DomEventRecord';
 
export class PlayBack {
    selectorHash:any = {};
    userEventLog = null;
    $fakeCursor = $('<div class="cursor"></div>');
    constructor(playbackData: any) {
        // const self = this;
        // Validate the playback file we've received
        if (typeof playbackData == 'object') {
            // We won't run the playback file without the window attributes (i.e., browser window dimensions)
            if (typeof playbackData.window == 'object') {
                Object.assign(window, playbackData.window);
                // window = playbackData.window;
            } else {
                throw new Error('Playback JSON file does not contain required window attributes.');
            }

            // Verify that the event_log is an array, if it's not an array, then this is an invalid playback JSON file.
            if (Array.isArray(playbackData.event_log)) {
                this.insertFakerCursor();
                this.userEventLog = playbackData.event_log;
            } else {
                throw new Error('Event log in the JSON playback file is not an array.');
            }
        } else {
            throw new Error('Received an invalid playback JSON file.');
        }

    }

    insertFakerCursor = () => {
        $(document.body).append(this.$fakeCursor);
    }
    flashCursor = (type:any, x:any, y:any) => {
        // if (type === "click" || type === "mousemove") {
            this.$fakeCursor.css({
              top: y,
              left: x
            });
         // }
      
          if (type === 'click' || type === 'mousedown') {
            this.$fakeCursor.addClass('click');
          } else {
            this.$fakeCursor.removeClass('click');
          }
    
    }

    /* 	Function: verifyContains
            Verifies whether the element specified by the userEvent.selector contains the text stored in userEvent.text

        Parameters:
            userEvent - Object, a single DOM event from the JSON playback file.

        Returns:
            Boolean - true if the element does contain the specified text or false if it does not.
    */
    verifyContains = (userEvent: UserEvent) => {

        const elementText = ($(userEvent.selector).val() || $(userEvent.selector)[0].innerHTML) as string;

        if (elementText.indexOf(userEvent.text) !== -1) {
            console.debug('PASS - element does contain specified text.');
        } else {
            throw new Error('FAIL - element does not contain specified text.');
        }
    };

    /*	Function: simulateEvent
            Replays the DOM event specified by userEvent -- uses the same event type and same coordinates that were originally recorded for the event.

        Parameters:
            userEvent - Object, a single DOM event from the JSON playback file.

        Returns:
            Nothing.
    */
    simulateEvent = (userEvent: UserEvent) => {
        let eventTarget;
        if (userEvent.selector in this.selectorHash) {
            eventTarget = this.selectorHash[userEvent.selector];
        } else {

            if (userEvent.selector === 'document') {

                eventTarget = document;
            } else {
                eventTarget = $(userEvent.selector)[0];
                console.log(eventTarget)
            }

            // eslint-disable-next-line no-prototype-builtins
            if (userEvent.hasOwnProperty('clientX') && userEvent.hasOwnProperty('clientY')) {

                // get the target based on the click coordinates
                const target = document.elementFromPoint(userEvent.clientX, userEvent.clientY);

                // verify that the target from the coordinates matches the logged CSS selector
                if (target === eventTarget) {
                    console.debug('PASS - click target matches selector element.');
                    this.selectorHash[userEvent.selector] = eventTarget;

                } else {
                    throw new Error('FAIL - Element at point (' + userEvent.clientX + 'px, ' + userEvent.clientY + 'px) does not match selector ' + userEvent.selector);
                }

            }
        }

        console.debug('Simulating scroll (' + (userEvent.timeStamp / 1000).toFixed(3) + 's). Selector: ' + userEvent.selector);

        this.flashCursor(userEvent.type, userEvent.clientX, userEvent.clientY);
        let event = null;
        
        switch (userEvent.type) {
            case 'scroll':
                $(eventTarget).scrollLeft(userEvent.scrollLeft);
                $(eventTarget).scrollTop(userEvent.scrollTop);
                break;
            case 'focusin':
            case 'focusout':
            case 'focus':
            case 'blur':
                event = new FocusEvent(userEvent.type, userEvent);
                break;
            case 'tap':
            case 'click':
            case 'mouseup':
            case 'mousemove':
            case 'mousedown':
                event = new MouseEvent(userEvent.type, userEvent);
                break;
            case 'touchstart':
            case 'touchend':
            case 'touchmove':
            case 'touchcancel':
                // eslint-disable-next-line no-case-declarations
                let touchList:any[] = [];
                for (let i = 0; i < userEvent.touches.length; i++) {
                    const touch = userEvent.touches[i];
                    const newTouch = new Touch({
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
                        , 'target':$((touch as any).selector)[0]
                    });
                    touchList.push(newTouch);
                }

                userEvent.touches = touchList;

                touchList = [];
                for (let i = 0; i < userEvent.changedTouches.length; i++) {
                    const touch = userEvent.changedTouches[i];
                    const newTouch = new Touch({
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
                        , 'target':$((touch as any).selector)[0]
                    });
                    touchList.push(newTouch);
                }

                userEvent.changedTouches = touchList;

                event = new TouchEvent(userEvent.type, userEvent);

                break;
            case 'keypress':
            case 'keydown':
            case 'keyup':
                event = new KeyboardEvent(userEvent.type, userEvent);
                break;
            case 'input':
                event = new Event(userEvent.type, userEvent);
                $(userEvent.selector).val(userEvent.value);
                break;
            case 'contains':
                this.verifyContains(userEvent);
                return;
            default:
                throw new Error('Unsupported event type.');
                break;
        }

        if (event !== null) {
            eventTarget.dispatchEvent(event);
        }

    };

        /*	Method: start
                This method will start the playback of the user event log.
        */
    start = () => {

            // var self = this;

            if ((window as any).playbackInProgress !== false) {
                throw new Error('无法启动回放--另一个回放◀已在进行中。');
                return;
            }

            if ((window as any).recordInProgress !== false) {
                throw new Error('无法启动回放--另一个录制正在进行中。');
                return;
            }

            if (window.innerHeight !== (window as any).height || window.innerWidth !== (window as any).width) {
                throw new Error('无法启动回放--浏览器窗口必须与录制播放脚本的宽高匹配 (' + (window as any).width + 'px by ' + (window as any).height + 'px). Window is currently ' + window.innerWidth + 'px by ' + window.innerHeight + 'px.');
                return;
            }

            console.log('Starting test script playback.');

            (window as any).playbackInProgress = true;

            // record the time that the user started the playback
            const timeStartedPlayback = new Date().getTime();

            // run the setInterval on a very short 10ms iteration so we can, as closely as possible, siumulate events exactly when they
            // were originally fired
            const runSimulator = setInterval(() => {

                const currentTime = new Date().getTime();

                // we store the array length as a variable for performance reasons (faster than continually accessing the .length property).
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                let userEventLength = this.userEventLog.length;

                // if the current time is greater than the timestamp of the first event in the array (e.g., 3000ms) plus when the playback started,
                // then the event should be triggered
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                if (currentTime > (this.userEventLog[0].timeStamp + timeStartedPlayback)) {
                    do {
                        // we're going to trigger this event, so we remove it from the array
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        const userEvent = this.userEventLog.splice(0, 1)[0];

                        // reduce the array length, must be done manually since we've stored the length in a variable for performance reasons
                        userEventLength--;


                        // trigger the event
                        this.simulateEvent(userEvent);


                        // continue this loop for events that occurred up to 50ms in the future. we do this because a simple user action like a mouse click
                        // will trigger multiple events (click, mousedown, mouseup, etc). if those events were separated by even 10ms, then the DOM could change in-between
                        // those events and we'd encounter an element target mismatch. looking forward 200ms and firing them at the same time allows us to avoid this issue.
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                    } while (userEventLength > 0 && ((currentTime + 50) > (this.userEventLog[0].timeStamp + timeStartedPlayback)));
                }

                // if userEventLength is 0, then that means there are no more events to replay
                if (userEventLength == 0) {
                    clearInterval(runSimulator);
                    console.debug('Test script playback finished.');
                    (window as any).playbackInProgress = false;
                }
            }, 10);

    }

}

