<template>
    <div>
      Count: {{ counterStore.count }}
      Doubled: {{ counterStore.doubleCount }}
    </div>
    <br />
    <div>
        <button @click="counterStore.decrement">-</button>
        <button @click="counterStore.increment">+</button>
    </div>
    <br />
    <div>
        <button @click="counterStore.undo">Undo</button>
        <button @click="counterStore.redo">Redo</button>
    </div>
  </template>

<script setup lang="ts">
import { useCounterStore } from "./store";

const counterStore = useCounterStore();
</script>