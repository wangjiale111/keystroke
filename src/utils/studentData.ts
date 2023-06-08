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

