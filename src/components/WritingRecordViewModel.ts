import {Vue} from "vue-class-component";
import index from "@/store"
import {DomEventRecord} from "@/record/DomEventRecord";
import {template} from "lodash";

export interface UserViewModel {
    classKey: string;

    modelKey: string;
    modelValue: any;
    // 时间戳
    timeStamp?: number;
    index?:number;
}

const domRecord = new DomEventRecord();
let recordData:any;

export const CurriculumViewModelClasskey = {
    CurriculumDisconnectViewModel: 'CurriculumDisconnectViewModel',
    CooperativeViewModel: 'CooperativeViewModel',
    ScientificWritingCurriculumViewModel: 'ScientificWritingCurriculumViewModel',
    PersonalChoiceViewModel: 'PersonalChoiceViewModel',
    MaterialWithWritingViewModel:'MaterialWithWritingViewModel',
    WritingViewModel: 'WritingViewModel',
    ChoiceWithReasonViewModel: 'ChoiceWithReasonViewModel',
    IMViewModel:'IMViewModel'
};

export default class WritingRecordViewModel extends Vue{


    domRecord: any;
    recordData: any[] = [];
    value = '';
    replayData: any[] = [];
    num2 = 0;

    tostart(){
        console.log("record开始")
        this.domRecord = new DomEventRecord();
        this.domRecord.startRecord((log: any) => {
            console.log(log)
        });
        this.$watch('value', (newValue: any,oldValue: any) => {
            const data :UserViewModel = {
                classKey: 'writing',
                modelValue: newValue,
                modelKey: 'writing',
                timeStamp: 0
            };
            const temp = this.domRecord.recordUserViewModel(data, 0, 1);
            this.replayData.push(temp);
        }, { deep: true, immediate: true });
    }

    toStop(){
        console.log("点击提交，结束录制")
        recordData =this.domRecord.stopRecord((log: any) => {
            console.log(log)
        });
        index.setState(JSON.parse(JSON.stringify(this.replayData)))
    }
}