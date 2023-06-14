import { createStore } from "vuex";

const store = createStore({
    state: {
        tabs: [],
    },
    mutations: {
        ADD_TAB: (state: any, tab: any) => {
            const exists = state.tabs.some(
                (item: any) => item.path === tab.path
            );
            if (!exists) {
                state.tabs.push(tab);
            }
        },
        REMOVE_TAB: (state: any, index: number) => {
            state.tabs.splice(index, 1);
        },
    },
    actions: {
        addTab({ commit }, tab) {
            commit("ADD_TAB", tab);
        },
        removeTab({ commit }, index) {
            commit("REMOVE_TAB", index);
        },
    },
    modules: {},
});

export default store;