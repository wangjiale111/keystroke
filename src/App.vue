<template>
    <nav>
        <router-link to="/record">写作</router-link> |
        <router-link to="/replay">回放</router-link>
    </nav>
    <router-view></router-view>
</template>
<script lang="ts">

import { Options, mixins } from 'vue-class-component';
import {AppViewModel} from "@/AppViewModel";

@Options({

})
export default class AppPage extends mixins(AppViewModel) {

}
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
}

nav {
    padding: 30px;
}

nav a {
    font-weight: bold;
    color: #2c3e50;
}

nav a.router-link-exact-active {
    color: #42b983;
}
</style>
