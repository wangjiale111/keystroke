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
</style>
