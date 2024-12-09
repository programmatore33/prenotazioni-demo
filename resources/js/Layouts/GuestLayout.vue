<script setup>
import ApplicationLogo from '@/js/Components/ApplicationLogo.vue'
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <div
    class="prenotazioni-app min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100 dark:bg-gray-900"
  >
    <div>
      <Link href="/">
        <ApplicationLogo class="fill-current text-gray-500" />
      </Link>
    </div>

    <div
      class="w-full sm:max-w-md mt-6 px-6 py-4 bg-white dark:bg-gray-800 shadow-md overflow-hidden sm:rounded-lg"
    >
      <slot />
    </div>
  </div>
</template>
<style lang="postcss">
.prenotazioni-app {
  background: url('@/assets/images/bg.webp') center/cover;
}
</style>
