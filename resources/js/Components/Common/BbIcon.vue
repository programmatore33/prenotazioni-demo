<template>
  <i v-bind="iconAttributes" ref="container"></i>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { isCssColor } from "@/js/Utilities/functions/isCssColor";
import { flow } from "@/js/Utilities/functions/flow";
import { initial } from "@/js/Utilities/functions/initial";
import { last } from "@/js/Utilities/functions/last";
import { mapKeys } from "@/js/Utilities/functions/mapKeys";
import type { Class } from "@/js/Types/Class";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

interface Props {
  color?: string;
  size?: Size | number | string;
  type: string;
}
const props = withDefaults(defineProps<Props>(), {
  size: "md",
});

const container = ref<HTMLElement | null>(null);

const sizeMap: Record<Size, number> = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 28,
  xl: 36,
  xxl: 40,
};

const iconAttributes = computed(() => {
  const classes: Class = {
    "bb-icon": true,
  };
  const width = computed(() => {
    let dimension: number;
    if (typeof props.size === "string") {
      dimension = sizeMap[props.size as Size] ?? parseInt(props.size, 10);
    } else {
      dimension = props.size;
    }
    return dimension + `px`;
  });
  let style: { [key: string]: any } = { width: width.value };

  if (props.color) {
    if (isCssColor(props.color)) {
      style.color = props.color;
    } else {
      classes[`text-${props.color}`] = true;
    }
  }
  return {
    class: classes,
    style,
  };
});

/**
 * Cast imported svg to string
 */
const modules = import.meta.glob("@/assets/icons/**", {
  as: "raw",
}) as unknown as Record<string, () => Promise<string>>;
// Get the name of the icon without extension
const getModuleName = flow([
  (value: any, key: string) => key.split(/[/.]+/g),
  initial,
  last,
]);
// Makes a map of all the icons indexed by name without extension
const icons = mapKeys(modules, getModuleName);

const setIcon = () => {
  if (typeof icons[props.type] === "undefined")
    throw new Error(`Icon "${props.type}" does not exist.`);
  return icons[props.type]().then((content) => {
    if (container.value) {
      container.value.innerHTML = content;
    }
  });
};

onMounted(setIcon);
watch(() => props.type, setIcon);
</script>

<style lang="postcss" scoped>
.bb-icon {
  display: inline-block;
  transition: color 0.05s;
}
</style>
