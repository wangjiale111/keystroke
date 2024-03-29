import {UserViewModel} from './DomEventRecord';

export class ViewModelPlayBack {

    userViewModelLog = null;
    runSimulator = null;

    constructor(userViewModelLog: any) {
        this.userViewModelLog = userViewModelLog;
    }


    start = (userId: string, finish?: any) => {

        console.log('Starting test script playback.');


        const timeStartedPlayback = new Date().getTime();

        this.runSimulator = setInterval(() => {

            const currentTime = new Date().getTime();
            let userEventLength = (this.userViewModelLog as any).length;

            // 无回放数据的时候取消loading
            if (userEventLength == 0) {
                if (finish && typeof (finish) == 'function') {
                    finish();
                    finish = null;
                }
                clearInterval(this.runSimulator);
                console.debug('Test script playback finished.');

            }
            if ((this.userViewModelLog as any)[0]){
                if (currentTime > ((this.userViewModelLog as any)[0].timeStamp + timeStartedPlayback)) {
                    do {
                        // 将timetemp为0的处理完后，回调取消loading，开始正常回放
                        if ((this.userViewModelLog as any)[0].timeStamp >= 1000 && finish &&
                            typeof (finish) == 'function') {
                            finish();
                            finish = null;
                        }
                        const userEvent = (this.userViewModelLog as any).splice(0, 1)[0] as UserViewModel;
                        userEventLength--;
                        /**
                         * 接收类，定义唯一classKey
                         * emitter.on('foo', e => console.log('foo', e) )
                         */

                        // 发送消息给对应的vue class
                        (window as any).emitter.emit(userId, {
                            classKey: userEvent.classKey,
                            value: userEvent.text,
                            timeStamp: userEvent.timeStamp,
                            ChineseLength: userEvent.ChineseLength
                        });
                    } while (userEventLength > 0 &&
                    ((currentTime + 50) > ((this.userViewModelLog as any)[0].timeStamp + timeStartedPlayback)));
                }
            }
            /* // 当前无回放回放数据取消loading
             if(userEventLength > 0 && ((currentTime + 50) <= ((this.userViewModelLog as any)[0].timeStamp + timeStartedPlayback))){
                 if( finish && typeof(finish) == 'function'){
                     finish();
                     finish = null;
                 }
             }*/
        }, 10);

    }
    stop = () => {
        clearInterval(this.runSimulator);
        this.userViewModelLog = null;
        console.debug('Test script playback stop.');

    }

}

