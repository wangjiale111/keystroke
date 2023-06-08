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

const colors = ['red', 'blue', 'green'];

export function barChart(data) {
    const timeDurationData = data.map(d => d.timeDuration);
    const option = {
        color: colors,
        tooltip: {},
        legend: {
            data: actions,
        },
        xAxis: {
            type: 'category',
            axisLabel: {
                interval: 0,
                rotate: 30,
            },
            data: timeDurationData.reduce((arr, curr) => arr.concat(curr), []),
        },
        yAxis: {
            type: 'value',
            boundaryGap: [0, '100%'],
        },
        series: actions.map((a, j) => {
            return {
                name: a,
                type: 'bar',
                label: {
                    show: true,
                    position: 'top',
                },
                data: data.map(d => d.actionProbabilities.map(p => p[j])).reduce((arr2, curr2) => arr2.concat(curr2), []),
            };
        }),
    };
    return option;
}

export function scatterChart(data) {
    const option = {
        xAxis: {
            type: 'value',
        },
        yAxis: {
            type: 'value',
            boundaryGap: [0, '100%'],
        },
        series: [
            {
                symbolSize: 20,
                data: data.map((d, i) => [i, d.meanLatentVariable]),
                type: 'scatter',
            },
        ],
    };
    return option;
}

export function pieChart(data) {
    const clusterCounts = Array.from({ length: 3 }, () => 0);
    data.forEach(d => clusterCounts[d.cluster]++);
    const option = {
        tooltip: {
            trigger: 'item',
        },
        legend: {
            data: Array.from({ length: 3 }, (_, i) => `Cluster ${i + 1}`),
        },
        series: [
            {
                name: 'Clusters',
                type: 'pie',
                radius: '70%',
                data: clusterCounts.map((c, i) => ({
                    value: c,
                    name: `Cluster ${i + 1}`,
                })),
            },
        ],
    };
    return option;
}

export function lineChart(data) {
    const option = {
        tooltip: {
            trigger: 'axis',
        },
        legend: {
            data: data.map((_, i) => `Student ${i + 1}`),
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
        },
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                data: data[0].timeDuration.map((_, i) => `Time ${i + 1}`),
            },
        ],
        yAxis: [
            {
                type: 'value',
            },
        ],
        series: data.map((d, i) => {
            return {
                name: `Student ${i + 1}`,
                type: 'line',
                data: d.meanLatentVariable,
            };
        }),
    };
    return option;
}

export function heatmapChart(data) {
    const option = {
        tooltip: {
            position: 'top',
        },
        animation: false,
        grid: {
            height: '50%',
            top: '10%',
        },
        xAxis: {
            type: 'category',
            data: data[0].timeDuration.map((_, i) => `Time ${i + 1}`),
            splitArea: {
                show: true,
            },
        },
        yAxis: {
            type: 'category',
            data: actions,
            splitArea: {
                show: true,
            },
        },
        visualMap: {
            min: 0,
            max: 1,
            show: false,
        },
        series: [
            {
                name: 'Heatmap',
                type: 'heatmap',
                data: data
                    .map(d => d.actionProbabilities)
                    .reduce((arr, curr) => arr.concat(curr), [])
                    .map((ap, i) => [i % 5, Math.floor(i / 5), ap[0]]),
                itemStyle: {
                    emphasis: {
                        borderColor: '#333',
                        borderWidth: 1,
                    },
                },
                progressive: 1000,
                animation: false,
            },
        ],
    };
    return option;
}