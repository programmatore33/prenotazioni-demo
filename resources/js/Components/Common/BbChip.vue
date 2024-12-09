<template>
  <span
    class="bb-chip"
    :class="{
      'bb-chip--clearable': clearable,
      'bb-chip--rounded': rounded,
      'bb-chip--outlined': outlined,
      [`bb-chip--${color}`]: true,
    }"
    ><span class="bb-chip__content"><slot></slot></span
    ><button
      v-if="clearable"
      class="bb-chip__clear-button"
      @click.stop="onClear"
      type="button"
    >
      <span class="bb-chip__clear-button-label">Chiudi</span>
      <BbIcon type="close" size="10"></BbIcon></button
  ></span>
</template>

<script setup>
import BbIcon from "./BbIcon.vue";

defineProps({
  clearable: {
    type: Boolean,
  },
  rounded: {
    type: Boolean,
  },
  outlined: {
    type: Boolean,
  },
  color: {
    type: String,
    default: "primary",
  },
});

const emit = defineEmits(["click:clear"]);

const { t } = useI18n();

const onClear = (event) => emit("click:clear", event);
</script>
