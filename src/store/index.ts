import { defineStore } from 'pinia';

export const useTabsStore = defineStore('tabs', {
    state: () => ({
        tabs: [],
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
