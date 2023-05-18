<template>
    <div class="main">
        <div class="record">
            <WritingRecord></WritingRecord>
        </div>
        <div class="replay">
            <ReplayView></ReplayView>
        </div>
    </div>
</template>
<script lang="ts">
import { Options, mixins } from 'vue-class-component';
import {AppViewModel} from "@/AppViewModel";
import WritingRecord from "@/components/WritingRecord.vue";
import ReplayView from "@/views/ReplayView.vue";

@Options({
  components:{
    WritingRecord,
    ReplayView
  }
})

export default class AppPage extends mixins(AppViewModel) {

}
</script>

<style>
.main {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    height: 100vh;
}

.record {
    padding: 20px;
    margin-right: 10px;
    margin-top: 30px;
}

.replay {
    padding: 20px;
    margin-left: 10px;
    margin-top: -20px;
}

WritingRecord {
    font-size: 18px;
}

ReplayView {
    font-size: 18px;
}
</style>
