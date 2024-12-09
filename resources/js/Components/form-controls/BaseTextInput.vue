<template>
  <span :class="classes" class="bb-base-text-input__container">
    <slot name="prepend-outer"></slot>
    <span class="bb-base-text-input__inner-container">
      <slot name="prepend"></slot>
      <input
        :autocomplete="autocomplete"
        :disabled="disabled"
        :id="id"
        :name="name"
        :placeholder="placeholder"
        :readonly="readonly"
        :type="type"
        :value="modelValue"
        v-bind="eventListeners"
        ref="input"
      />
      <slot name="append"></slot>
    </span>
    <slot name="append-outer"></slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  autocomplete?: string;
  disabled?: boolean;
  hasErrors?: boolean;
  id?: string;
  modelValue?: any;
  name?: string;
  placeholder?: string;
  readonly?: boolean;
  type?: "text" | "number" | "date" | "datetime-local" | "email" | "password";
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
});

const emit = defineEmits([
  "blur",
  "change",
  "click:clear",
  "click",
  "focus",
  "input",
  "keydown",
  "mousedown",
  "mouseup",
  "update:modelValue",
]);

const classes = computed(() => ({
  "bb-base-text-input": true,
  "bb-base-text-input--errors": props.hasErrors,
  "bb-base-text-input--readonly": props.readonly,
  "bb-base-text-input--disabled": props.disabled,
}));

/**
 * These events are just propagated
 */
const eventListeners = {
  onBlur: (event: FocusEvent) => emit("blur", event),
  onChange: (event: Event) => emit("change", event),
  onClick: (event: MouseEvent) => emit("click", event),
  onFocus: (event: FocusEvent) => emit("focus", event),
  onInput: (event: Event) => {
    if (event.target instanceof HTMLInputElement) {
      emit("update:modelValue", event.target.value);
    }
    emit("input", event);
  },
  onMousedown: (event: MouseEvent) => emit("mousedown", event),
  onMouseup: (event: MouseEvent) => emit("mouseup", event),
};
</script>
<style lang="postcss">
.bb-base-text-input {
  &--disabled {
    .bb-base-text-input__inner-container {
      @apply bg-gray-100 opacity-50;
    }
  }
  &--errors {
  }
  &--readonly {
  }

  &__container {
    @apply inline-flex items-center;
  }
  &__inner-container {
    @apply w-full flex-auto inline-flex items-center overflow-hidden pb-1 transition-colors;
  }
  input {
    @apply px-6 w-full flex-auto focus:outline-none bg-transparent text-[14px] leading-[18px] md:text-base font-normal bg-white border focus-within:border-primary focus-within:ring-0 focus-within:drop-shadow focus-within:shadow-primary border-grey-300 rounded-[8px] transition-colors;

    &:autofill,
    &:-webkit-autofill {
      @apply !bg-red-300;
    }

    &::placeholder {
      @apply text-grey-500 text-sm;
    }
  }
}
</style>
