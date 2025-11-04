import { Store } from '@tanstack/store'

export const cardsStore = new Store({
  cards: [] as number[],
  cardsFetched: null as number | null,
})

export const gameStore = new Store({
  challengeRecordId: null as string | null,
  accepter: null as string | null,
  gameSelected: null as string | null,
  gameState: null as any,
})
