<template>
  <form @submit="onSubmit">
    <slot
      :isSubmitting="isSubmitting"
      :submitCount="submitCount"
      :resetForm="resetForm"
      :validate="validate"
      :values="values"
      v-bind="meta"
    ></slot>
  </form>
</template>

<script setup>
import { identity } from 'lodash'
import { useForm } from 'vee-validate'
const props = defineProps({
  onSubmit: {
    type: Function,
    default: identity
  }
})
const { handleSubmit, isSubmitting, submitCount, resetForm, meta, values, validate } = useForm()

const onSubmit = handleSubmit(props.onSubmit)
</script>
