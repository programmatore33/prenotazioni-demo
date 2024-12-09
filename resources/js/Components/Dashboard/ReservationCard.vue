<template>
  <div class="reservation-card grid grid-cols-1 gap-1 w-full">
    <div
      class="bg-primary-200 px-3 rounded"
      :class="{
        'opacity-50 border border-dashed border-primary-900 py-[1px] print:hidden':
          !reservation?.room_id,
        'py-0.5': reservation?.room_id
      }"
    >
      <div class="flex gap-2 items-center">
        <div class="text-sm leading-3 text-gray-800 self-center">
          <div
            class="w-14 md:w-[120px] print:w-auto print:whitespace-nowrap text-sm md:text-base print:text-sm font-courier pt-[1px]"
          >
            <template v-if="reservation?.start_date && reservation?.end_date">
              <span>{{ startTime }}</span
              ><span class="px-[2px]">-</span><span>{{ endTime }}</span>
            </template>
            <template v-else> - </template>
          </div>
        </div>
        <div
          v-if="reservation.room_id"
          class="leading-4 flex justify-between items-center gap-6 w-full"
        >
          <div class="break-all">
            <span
              :class="{
                'text-primary-500': reservation?.start_date,
                'text-primary-800': !reservation?.start_date
              }"
              class="font-bold font-sans"
              >{{ reservation.name }}</span
            >
            <span
              v-if="reservation.phone"
              class="text-gray-500 font-sans ml-1 font-normal text-sm whitespace-nowrap"
              >({{ reservation.phone }})</span
            >
          </div>
          <div class="flex items-center gap-1 font-sans">
            <div class="text-right">
              <span
                class="text-sm border-r border-gray-200 pr-1.5 leading-4 font-medium"
                v-if="reservation.extra"
              >
                {{ reservation.extra }}
              </span>
              <span class="pl-1.5 text-right text-sm leading-4">
                {{ examName }}
              </span>
            </div>
            <div class="flex gap-1 reservation-actions" v-if="actions">
              <ShowMoreDropdown type="system">
                <template #activator>
                  <BaseAction
                    class="text-primary"
                    @click="
                      () => {
                        router.visit(
                          route('reservations.edit', {
                            reservation: reservation.id,
                            room: room.id
                          })
                        )
                      }
                    "
                    icon="pencil"
                    size="10"
                  />
                </template>
                Modifica
              </ShowMoreDropdown>
              <ShowMoreDropdown type="system">
                <template #activator>
                  <BaseAction
                    class="text-primary"
                    @click="
                      () => {
                        emit('delete', reservation.id)
                      }
                    "
                    icon="trash"
                    size="10"
                  />
                </template>
                Elimina
              </ShowMoreDropdown>
            </div>
          </div>
        </div>
        <div v-else class="flex justify-between items-center gap-6 w-full">
          <button
            @click="
              () => {
                router.visit(
                  route('reservations.create', {
                    room: room.id,
                    start: reservation.start_date
                  })
                )
              }
            "
            v-if="actions && !isPast"
            type="button"
          >
            <span class="text-sm font-semibold font-sans text-gray-600">
              <BbIcon class="mr-1" type="plus_circle" size="12"></BbIcon
              >Aggiungi prenotazione</span
            >
          </button>
          <span v-else class="text-sm font-semibold font-sans text-gray-600"
            >Nessuna prenotazione</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'
import { router } from '@inertiajs/vue3'

import BaseAction from '@/js/Components/Common/BaseAction.vue'
import ShowMoreDropdown from '@/js/Components/Common/ShowMoreDropdown.vue'
import BbIcon from '@/js/Components/Common/BbIcon.vue'

const emit = defineEmits(['delete'])

const props = defineProps({
  reservation: { type: Object },
  room: { type: Object },
  actions: { type: Boolean, default: true }
})

const isPast = computed(() => dayjs(props.room?.date).isBefore(dayjs(), 'day'))

const examName = computed(() =>
  props.reservation?.exams?.map(e => e.name).join(', ')
)

const startTime = computed(() =>
  dayjs(props.reservation?.start_date).format('HH:mm')
)
const endTime = computed(() =>
  dayjs(props.reservation?.end_date).format('HH:mm')
)
</script>
<style lang="postcss">
.reservation-card {
  .bg-pattern {
    background-color: #e5e5f7;
    opacity: 0.8;
    background: repeating-linear-gradient(
      45deg,
      #444cf7,
      #444cf7 5px,
      #e5e5f7 5px,
      #e5e5f7 25px
    );
  }

  .reservation-actions {
    .base-action {
      @apply w-8 h-8 md:w-5 md:h-5 print:hidden;
    }
  }
}
</style>
