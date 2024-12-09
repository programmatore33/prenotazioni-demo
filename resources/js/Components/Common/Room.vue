<template>
  <div
    class="room-card flex flex-col rounded-lg border-2 border-primary print:border-0 overflow-hidden min-h-[280px]"
  >
    <div
      class="title grid grid-cols-12 justify-between py-1 px-3 items-center bg-primary-50 border-b border-primary rounded-t-lg"
    >
      <div class="col-span-2 flex gap-1">
        <div class="relative">
          <Dropdown align="left" width="32">
            <template #trigger>
              <span class="inline-flex rounded-md print:hidden">
                <button
                  type="button"
                  class="inline-flex items-center px-2 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                >
                  <BbIcon type="ellipsis_vertical" size="5"></BbIcon>
                </button>
              </span>
            </template>

            <template #content>
              <DropdownLink
                @click="
                  () => {
                    emit('room:edit', room.id)
                  }
                "
                as="button"
              >
                Modifica
              </DropdownLink>
              <DropdownLink
                v-if="room?.reservations.length == 0"
                @click="() => deleteRoom(room.id)"
                as="button"
              >
                Elimina
              </DropdownLink>
            </template>
          </Dropdown>
        </div>
      </div>
      <div class="col-span-8">
        <p
          class="text-center text-[16px] leading-[24px] md:text-[18px] md:leading-[28px] font-semibold font-poppins text-primary"
        >
          {{ room.name }}
        </p>
      </div>
      <div class="col-span-2 place-self-end text-primary">
        <ShowMoreDropdown type="system" v-if="!isPast">
          <template #activator>
            <BaseAction
              v-if="id"
              class="w-9 h-9 text-primary pt-3 print:hidden"
              @click="
                () => {
                  router.visit(route('reservations.create', { room: id }))
                }
              "
              icon="plus_circle"
              size="28"
            />
          </template>
          Nuova prenotazione
        </ShowMoreDropdown>
      </div>
    </div>
    <div
      class="flex flex-col gap-1 justify-start items-center h-full bg-primary-50 p-2"
    >
      <template
        v-if="room?.reservations.length"
        v-for="reservation in room?.reservations"
        :key="reservation.id"
      >
        <ReservationCard
          :reservation="reservation"
          :room="room"
          @delete="id => deleteReservation(id)"
        ></ReservationCard>
      </template>
      <p v-else class="text-primary">Nessuna prenotazione</p>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { router } from '@inertiajs/vue3'
import { useUI } from '@/js/Store/ui'
import dayjs from 'dayjs'
import { useConfirm } from '@/js/composables/useConfirm'
import { useEventBus } from '@/js/composables/useEventBus'

import BbIcon from '@/js/Components/Common/BbIcon.vue'
import BaseAction from '@/js/Components/Common/BaseAction.vue'
import ShowMoreDropdown from '@/js/Components/Common/ShowMoreDropdown.vue'
import ReservationCard from '@/js/Components/Dashboard/ReservationCard.vue'
import Dropdown from '@/js/Components/Dropdown.vue'
import DropdownLink from '@/js/Components/DropdownLink.vue'

const uiStore = useUI()
const isPast = computed(() =>
  dayjs(uiStore.dateBar.date).isBefore(dayjs(), 'day')
)

const { emit } = useEventBus()

defineProps({
  id: { type: Number },
  room: { type: Object }
})

const deleteReservation = async id => {
  const { confirm, close } = useConfirm()
  const res = await confirm({
    title: 'Eliminare prenotazione?',
    text: `Sei sicuro di voler eliminare la prenotazione?`,
    yesText: 'Elimina'
  })
  if (res) {
    router.delete(
      route('reservations.destroy', {
        reservation: id
      }),
      {
        onFinish: () => {
          emit('date:update')
          close()
        }
      }
    )
  } else {
    close()
  }
}

const deleteRoom = async id => {
  const { confirm, close } = useConfirm()
  const res = await confirm({
    title: 'Eliminare stanza?',
    text: `Sei sicuro di voler eliminare la stanza?`,
    yesText: 'Elimina'
  })
  if (res) {
    router.delete(
      route('rooms.destroy', {
        room: id
      }),
      {
        onFinish: () => {
          emit('date:update')
          close()
        }
      }
    )
  } else {
    close()
  }
}
</script>
<style lang="postcss">
.room-card {
  .title {
    @apply min-h-[49px];
    .bb-base-text-input {
      &__inner-container {
        @apply !border-0 rounded-none bg-transparent;
      }

      input {
        @apply border-0 p-1 text-center text-[16px] leading-[24px] md:text-[18px] md:leading-[28px] font-semibold font-poppins text-primary;
      }
    }
  }
}
</style>
