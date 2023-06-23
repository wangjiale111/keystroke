import { defineStore } from 'pinia';

export const useTabsStore = defineStore('tabs', {
    state: () => ({
        tabs: [],
        title: '名校生涯后的孔乙己困境：自我成长与社会期待的矛盾',
        requirements: '字数不少于500字',
    }),
    actions: {
        addTab(tab) {
            const tabIdentifier = `${tab.path}:${tab.query?.userName}`;

            const exists = this.tabs.some((item) => item.identifier === tabIdentifier);
            if (!exists) {
                this.tabs.push({ ...tab, identifier: tabIdentifier });
            }
        },
        removeTab(index) {
            this.tabs.splice(index, 1);
        },
    },
});
