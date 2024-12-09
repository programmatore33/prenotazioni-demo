<template>
  <div class="date-bar-container grid grid-cols-12">
    <div class="col-span-3 self-center md:self-start">
      <div class="inline">
        <BbButton
          size="sm"
          v-if="!UI.dateBar.readOnly"
          @click="goToday"
          inline
          color="tertiary"
          type="button"
        >
          <div class="flex items-center gap-1 py-2 md:py-0 lg:px-2">
            <BbIcon type="home" size="12" />
            <span class="hidden lg:inline"> Oggi </span>
          </div>
        </BbButton>
        <BbButton
          class="ml-2"
          size="sm"
          v-if="!UI.dateBar.readOnly"
          @click="openGoToDateModal()"
          inline
          color="tertiary"
          type="button"
        >
          <div class="flex items-center gap-1 py-2 md:py-0 lg:px-2">
            <BbIcon type="calendar_day" size="10" />
            <span class="hidden lg:inline"> Vai a </span>
          </div>
        </BbButton>
      </div>
    </div>
    <div class="col-span-6 sel">
      <div class="flex justify-center items-center text-primary gap-2 md:gap-6">
        <div class="flex gap-1 relative top-1">
          <ShowMoreDropdown type="system" v-if="!UI.dateBar.readOnly">
            <template #activator>
              <BaseAction
                class="w-9 h-9 text-primary"
                @click="
                  () => {
                    UI.subSevenDays()
                    emit('date:update')
                  }
                "
                icon="angles_left"
                size="30"
              />
            </template>
            Indietro 7 giorni
          </ShowMoreDropdown>
          <ShowMoreDropdown type="system" v-if="!UI.dateBar.readOnly">
            <template #activator>
              <BaseAction
                class="w-9 h-9 text-primary"
                @click="
                  () => {
                    UI.prevDate()
                    emit('date:update')
                  }
                "
                icon="chevron_left"
                size="16"
              />
            </template>
            Indietro
          </ShowMoreDropdown>
        </div>
        <div class="flex justify-center sm:min-w-[340px]">
          <span class="h3 capitalize text-center">{{
            dayjs(UI.dateBar.date).format('dddd DD MMMM YYYY')
          }}</span>
        </div>
        <div class="flex gap-1 relative top-1">
          <ShowMoreDropdown type="system" v-if="!UI.dateBar.readOnly">
            <template #activator>
              <BaseAction
                class="w-9 h-9 text-primary"
                @click="
                  () => {
                    UI.nextDate()
                    emit('date:update')
                  }
                "
                icon="chevron_right"
                size="16"
              />
            </template>
            Avanti
          </ShowMoreDropdown>
          <ShowMoreDropdown type="system" v-if="!UI.dateBar.readOnly">
            <template #activator>
              <BaseAction
                class="w-9 h-9 text-primary"
                @click="
                  () => {
                    UI.addSevenDays()
                    emit('date:update')
                  }
                "
                icon="angles_right"
                size="30"
              />
            </template>
            Avanti 7 giorni
          </ShowMoreDropdown>
        </div>
      </div>
    </div>
    <div
      class="col-span-3 text-primary flex justify-end justify-self-end gap-3"
    >
      <div class="self-center md:self-start" v-if="!UI.dateBar.readOnly">
        <BbButton
          size="sm"
          inline
          :color="UI.dateBar.amOrPm == 'AM' ? 'primary' : 'tertiary'"
          @click="
            () => {
              UI.dateBar.amOrPm = 'AM'
              emit('date:update')
            }
          "
          :disabled="UI.dateBar.readOnly"
        >
          <div class="flex items-center gap-1 py-2 md:py-0">
            <BbIcon type="sun" size="12" />
            <span class="hidden lg:inline"> Mattina </span>
          </div>
        </BbButton>
        <BbButton
          class="ml-2"
          size="sm"
          inline
          :color="UI.dateBar.amOrPm == 'PM' ? 'primary' : 'tertiary'"
          @click="
            () => {
              UI.dateBar.amOrPm = 'PM'
              emit('date:update')
            }
          "
          :disabled="UI.dateBar.readOnly"
        >
          <div class="flex items-center gap-1 py-2 md:py-0">
            <BbIcon type="moon" size="9" />
            <span class="hidden lg:inline"> Pomeriggio </span>
          </div>
        </BbButton>
      </div>
    </div>
    <BbDialog
      size="md"
      title="Vai al giorno"
      v-model="goToDateModal"
      @hidden="closeGoToDateModal"
    >
      <BbForm v-slot="{ valid }" @submit="goToDateSubmit()">
        <div class="grid grid-cols-1 gap-4 px-8 py-4">
          <div class="flex justify-center items-center p-8">
            <input type="date" name="goToDate" v-model="goToDateInput" />
          </div>
          <div class="flex justify-end gap-2 my-4">
            <BbButton
              color="tertiary"
              type="button"
              @click="closeGoToDateModal"
            >
              <span>Annulla</span>
            </BbButton>
            <BbButton :disabled="!valid" color="primary" type="submit">
              <span>Conferma</span>
            </BbButton>
          </div>
        </div>
      </BbForm>
    </BbDialog>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useReservation } from '@/js/Store/reservation'
import { useUI } from '@/js/Store/ui'
import { useEventBus } from '@/js/composables/useEventBus'
import { Head, useForm, usePage } from '@inertiajs/vue3'
import dayjs from 'dayjs'

import BaseAction from '@/js/Components/Common/BaseAction.vue'
import BbIcon from '@/js/Components/Common/BbIcon.vue'
import BbRadioGroup from '@/js/Components/form-controls/BbRadioGroup.vue'
import ShowMoreDropdown from '@/js/Components/Common/ShowMoreDropdown.vue'
import BbButton from '@/js/Components/Common/BbButton.vue'
import BbDialog from '@/js/Components/Common/BbDialog.vue'
import BbForm from '@/js/Components/form-controls/BbForm.vue'

const { emit } = useEventBus()

const reservationStore = useReservation()
const UI = useUI()

const goToDateInput = ref('')

const timeSettings = computed(() => usePage().props.timeSettings)

const goToday = () => {
  const d = new Date()
  let hour = d.getHours()
  if (hour >= timeSettings.value.morning_end) {
    UI.dateBar.amOrPm = 'PM'
  } else {
    UI.dateBar.amOrPm = 'AM'
  }
  UI.dateBar.date = Date.now()
  emit('date:update')
}

const goToDateModal = ref(false)
const openGoToDateModal = () => {
  goToDateModal.value = true
}

const closeGoToDateModal = () => {
  goToDateModal.value = false
}

const goToDateSubmit = () => {
  UI.dateBar.date = dayjs(goToDateInput.value).valueOf()
  closeGoToDateModal()
  emit('date:update')
}
</script>
<style lang="postcss">
.date-bar-container {
  .bb-base-radio-group__container {
    @apply flex gap-y-4 gap-x-0.5 flex-wrap;
    .bb-base-radio-group-option {
      @apply mr-0 w-auto;
    }
    .bb-base-radio {
      @apply flex;
      .bb-base-radio-container {
        .option {
          @apply w-auto inline-block bg-white rounded-full py-2 px-4 text-grey-800 font-medium transition-colors border border-grey-200;

          &__image {
            @apply rounded-2xl;
          }

          &--focused {
            @apply border-primary;
          }
          &--selected {
            @apply bg-primary-100 border-primary  text-primary;
          }
          &--disabled {
            @apply opacity-40 cursor-default;
          }
        }
      }
    }
  }
}
</style>
