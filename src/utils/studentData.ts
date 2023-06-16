import * as echarts from 'echarts';

const actions = ['删除', '插入', '暂停'];

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateData(numStudents) {
    const data = [];
    for (let i = 0; i < numStudents; i++) {
        const studentData = {
            timeDuration: Array.from({ length: 5 }, () => randomInt(1, 10)),
            actionProbabilities: Array.from({ length: 5 }, () =>
                Array.from({ length: actions.length }, () => Math.random()).map((p, i, arr) => p / arr.reduce((a, b) => a + b))
            ),
            meanLatentVariable: Array.from({ length: 5 }, () => Math.random()),
            cluster: randomInt(0, 2),
        };
        data.push(studentData);
    }
    return data;
}

export const question = [
    {
        key: 'q1',
        label: '1. 你的打字速度如何？',
        options: [
            { label: 'A. 非常快', value: 'A' },
            { label: 'B. 较快', value: 'B' },
            { label: 'C. 一般', value: 'C' },
            { label: 'D. 较慢', value: 'D' },
            { label: 'E. 非常慢', value: 'E' }
        ]
    },
    {
        key: 'q2',
        label: '2. 在平时的写作过程中，你是否经常出现错别字的情况？',
        options: [
            { label: 'A. 非常频繁', value: 'A' },
            { label: 'B. 较为频繁', value: 'B' },
            { label: 'C. 偶尔发生', value: 'C' },
            { label: 'D. 很少发生', value: 'D' },
            { label: 'E. 完全没有', value: 'E' }
        ]
    },
    {
        key: 'q3',
        label: '3. 你在平时的写作过程中，是否会使用一些特别的修辞手法（如比喻、反问等）？',
        options: [
            { label: 'A. 总是使用', value: 'A' },
            { label: 'B. 经常使用', value: 'B' },
            { label: 'C. 偶尔使用', value: 'C' },
            { label: 'D. 很少使用', value: 'D' },
            { label: 'E. 从不使用', value: 'E' }
        ]
    },
    {
        key: 'q4',
        label: '4. 对于长句的表达，你会选择何种方式？',
        options: [
            { label: 'A. 优先使用复杂句，尽可能让句子丰富多变', value: 'A' },
            { label: 'B. 喜欢使用并列句，直接明了', value: 'B' },
            { label: 'C. 喜欢分断成多个简单句，避免出错', value: 'C' },
            { label: 'D. 视语境和需要而定', value: 'D' },
            { label: 'E. 以上都不是，我有自己的方式', value: 'E' }
        ]
    },
    {
        key: 'q5',
        label: '5. 请选择一个最能描述你的写作过程的选项？',
        options: [
            { label: 'A. 写作全程都很顺畅，没有什么修改，没有遇到困难', value: 'A' },
            { label: 'B. 写作过程中不断修改，但最终能顺利完成', value: 'B' },
            { label: 'C. 在开始和结尾会遇到困难，其余时候能够正常进行', value: 'C' },
            { label: 'D. 写作全程都比较吃力，不断遇到困难，需要频繁修改', value: 'D' },
            { label: 'E. 会花很长时间构思，但一旦开始写作，就能顺利进行', value: 'E' }
        ]
    },
    {
        key: 'q6',
        label: '6. 以一个百分比来表示，你认为你的作文能打多少分？',
        options: [
            { label: 'A. 90-100', value: 'A' },
            { label: 'B. 70-90', value: 'B' },
            { label: 'C. 50-70', value: 'C' },
            { label: 'D. 30-50', value: 'D' },
            { label: 'E. 0-30', value: 'E' }
        ]
    },
    {
        key: 'q7',
        label: '7. 在你的写作过程中，你经历过以下哪种状态转变？',
        options: [
            { label: 'A. 从思考状态到流畅打字状态', value: 'A' },
            { label: 'B. 从打字状态到暂停并思考状态', value: 'B' },
            { label: 'C. 从流畅打字状态到频繁修改状态', value: 'C' },
            { label: 'D. 从频繁修改状态到再次流畅打字状态', value: 'D' },
            { label: 'E. 在上述状态之间反复切换', value: 'E' }
        ]
    },
    {
        key: 'q8',
        label: '8. 在写作过程中，你是否经常需要在思考和打字之间切换？',
        options: [
            { label: 'A. 总是这样', value: 'A' },
            { label: 'B. 经常这样', value: 'B' },
            { label: 'C. 偶尔这样', value: 'C' },
            { label: 'D. 很少这样', value: 'D' },
            { label: 'E. 从不这样', value: 'E' }
        ]
    },
    {
        key: 'q9',
        label: '9. 当你从一种状态切换到另一种状态时（例如从思考转到打字），是否需要一些时间来适应？',
        options: [
            { label: 'A. 总是需要', value: 'A' },
            { label: 'B. 经常需要', value: 'B' },
            { label: 'C. 偶尔需要', value: 'C' },
            { label: 'D. 很少需要', value: 'D' },
            { label: 'E. 从不需要', value: 'E' }
        ]
    },
    {
        key: 'q10',
        label: '10. 以下哪种观点更接近你的写作体验？',
        options: [
            { label: 'A. 我找到了一种平衡，可以在思考和打字之间无缝切换', value: 'A' },
            { label: 'B. 我的写作过程主要由思考和修改阶段组成，打字只是记录下我的想法', value: 'B' },
            { label: 'C. 我的写作主要是一次性思考好，然后快速打字记录下来', value: 'C' },
            { label: 'D. 我的写作过程中，思考和打字阶段经常交替出现，很难找到平衡', value: 'D' },
            { label: 'E. 我的写作过程是混乱的，没有固定的模式', value: 'E' }
        ]
    }
];

