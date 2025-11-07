export const ranks = [
  "King",
  "Queen",
  "Jack",
  "10",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
  "A",
]
export const suits = [
  "Hearts",
  "Diamonds",
  "Spades",
  "Clubs",
]

export function Card({ rank, suit }: { rank: string; suit: string; }) {
  return <div className="w-[10vw] min-w-[5rem] aspect-3/4 bg-[#efefef] rounded-xl">
      {/*// @ts-ignore*/}
      <playing-card className="w-[10vw] min-w-[5rem] aspect-3/4" rank={rank} suit={suit}></playing-card>
  </div>
}

export function Cardn({ n }: { n: number }) {
  return <Card suit={suits[Math.round(n / 13)]} rank={ranks[n % 13]} />
}
