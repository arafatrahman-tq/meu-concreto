<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="border-b border-border">
          <th
            v-for="(header, index) in headers"
            :key="index"
            class="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/40 first:pl-10 last:pr-10"
          >
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border/50">
        <slot />
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  headers: { type: Array, required: true },
})
</script>
