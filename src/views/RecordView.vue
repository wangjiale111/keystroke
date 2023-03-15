<template>
  <div class="record">
  <WritingRecord></WritingRecord>
  </div>
</template>

<script lang="ts">
import {mixins, Options} from 'vue-class-component';
import RecordViewModel from "@/views/RecordViewModel";
import WritingRecord from '@/components/WritingRecord.vue';


@Options({
  components:{
    WritingRecord
  }
})
export default class RecordView extends mixins(RecordViewModel) {}
</script>
