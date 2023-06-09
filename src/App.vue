<template>

    <router-view></router-view>

</template>

<script lang="ts">
import { Options, mixins } from "vue-class-component";
import RecordView from "@/views/RecordView.vue";
import { AppViewModel } from "@/AppViewModel";

@Options({
    components: {
        RecordView,
    },
})
export default class AppPage extends mixins(AppViewModel) {

}
</script>

<style>
.admin-login {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    margin-right: 250px;
}

.admin-login a {
    display: flex;
    align-items: center;
    color: #2c3e50;
    text-decoration: none;
    margin-left: 10px;
}

.admin-icon {
    position: absolute;
    top: 10px;
    right: 0;
    z-index: 999;
}
</style>
