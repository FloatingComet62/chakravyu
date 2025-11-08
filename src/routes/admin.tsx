import { suits } from '@/components/Card';
import { DatabaseContext } from '@/contexts/database'
import type { RootRoute } from '@tanstack/react-router'
import { createRoute, useNavigate } from '@tanstack/react-router'
import { useContext, useEffect, useState } from 'react'

function isTarget(card: number, suit: number) {
  const card_suit = Math.floor(card / 13);
  return card_suit == suit;
}

function Admin() {
  const pb = useContext(DatabaseContext);
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<{
    id: string;
    player1: {
      id: string;
      name: string;
    };
    player2: {
      id: string;
      name: string;
    };
    game_name: string;
    target_suit1: number;
    target_suit2: number;
  }[]>([]);

  async function refreshChallenges() {
    if (!pb) return;
    const res = await pb.collection('challenges').getFullList({
      expand: 'accepter,receiver,game'
    });
    setChallenges(res.filter(x => x.game).map(x => ({
      id: x.id,
      player1: {
        id: x.accepter,
        name: x.expand!.accepter.name
      },
      player2: {
        id: x.receiver,
        name: x.expand!.receiver.name
      },
      game_name: x.expand!.game.name,
      target_suit1: x.expand!.game.target_suit1,
      target_suit2: x.expand!.game.target_suit2,
    })));
  }

  useEffect(() => {(async () => {
    if (
      !pb
      || !pb.authStore.record
      // || !pb.authStore.record.is_admin
    ) { navigate({ to: '/' }); return; }
    await refreshChallenges();

    pb.collection('challenges').subscribe('*', () => {
      refreshChallenges();
    })

    return () => pb.collection('challenges').unsubscribe('*')
  })()}, []);
  const [winner, setWinner] = useState<"player1" | "player2" | "none">("none");

  async function declareWinner(i: number) {
    if (!pb) return;
    if (winner == "none") {
      alert("Pick a winner")
      return;
    }
    const challenge = challenges[i];
    const loser_player = winner == "player1" ? challenge.player2.id : challenge.player1.id;
    const winner_player = winner == "player1" ? challenge.player1.id : challenge.player2.id;

    const req_loser_cards = await pb.collection('user_cards').getList(1, 1000, {
      filter: `user_id=\"${loser_player}\"`
    });
    const loser_cards = req_loser_cards.items;
    loser_cards.forEach(async (card) => {
      if (
        !isTarget(card.card, challenge.target_suit1) &&
        !isTarget(card.card, challenge.target_suit2)
      ) {
        return;
      }
      await pb.collection('user_cards').update(card.id, {
        user_id: winner_player
      })
    })
    await pb.collection('challenges').delete(challenge.id);
    await refreshChallenges();
  }

  const [eventWinners, setEventWinners] = useState<{ name: string, suits_completed: string[] }[]>([])
  async function refreshEventWinners() {
    if (!pb) return;
    const winners = [];
    const cards = await pb.collection('user_cards').getFullList();
    const collection: {[key: string]: Set<number>} = {};
    for (const card of cards) {
      if (!collection[card.user_id]) {
        collection[card.user_id] = new Set();
      }
      collection[card.user_id].add(card.card)
    }
    console.log(collection);
    for (const user_id in collection) {
      const suit_cards_count = [0, 0, 0, 0];
      for (const card of collection[user_id]) {
        suit_cards_count[Math.floor(card / 13)]++;
      }
      console.log(user_id, suit_cards_count);
      const suits_completed = [];
      for (const suit in suit_cards_count) {
        if (suit_cards_count[suit] < 13) continue;
        suits_completed.push(suits[suit]);
      }
      if (suits_completed.length == 0) continue;
      const user = await pb.collection('users').getOne(user_id);
      winners.push({
        name: user.name as string,
        suits_completed: suits_completed,
      });
    }
    setEventWinners(winners);
  }

  async function giveEveryone4Cards() {
    if (!pb) return;
    const users = await pb.collection('users').getFullList();
    const players = users.filter(player => !player.is_admin)
    let deck = [[], [], [], []] as number[][];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 13; j++) deck[i].push(13 * i + j);

    for (const user of players) {
      // all the decks will drain together, so if one is empty, all will
      if (deck[0].length == 0) {
        // make a new deck, we have too many people playing
        for (let i = 0; i < 4; i++) for (let j = 0; j < 13; j++) deck[i].push(13 * i + j);
      }

      const cards_assigned = [];
      for (let i = 0; i < 4; i++) {
        const rand = Math.floor(Math.random() * deck[i].length);
        cards_assigned.push(deck[i].splice(rand, 1)[0]);
      }
      console.log(user.id, cards_assigned);
      for (const card_assigned of cards_assigned) {
        await pb.collection('user_cards').create({
          user_id: user.id,
          card: card_assigned,
        })
      }
    }

    console.log("left over cards: ", deck);
  }
  
  return <div className="w-screen min-h-screen flex flex-col justify-center items-center p-8 bg-[#202020] text-white flex flex-col gap-4 text-center overflow-scroll">
  <button className="p-4 pt-2 pb-2 cursor-pointer bg-[#ff5f30] hover:bg-[#ff0040]" onClick={() => {
    if (!confirm("ARE YOU SURE") || !confirm("ARE YOU REALLLLY SURE")) return;
    giveEveryone4Cards();
  }}>GIVE EVERYONE 4 CARDS</button>
  <div className="text-5xl">Event Winners</div>
  <button className="p-4 pt-2 pb-2 cursor-pointer bg-[#305fab] hover:bg-[#4870db]" onClick={refreshEventWinners}>Refresh</button>
  {eventWinners.map((winner, i) => <div key={`winner-${i}`} className="text-3xl">
    {winner.name} won by completing {winner.suits_completed.join(", ")}
  </div>)}
  <div className="text-5xl">Challenges</div>
  {challenges.map((challenge, i) => (<div key={`challenge-${i}`} className="flex gap-4 bg-[#303030] p-8 pt-4 pb-4">
    <div
      className="p-4 pt-2 pb-2 cursor-pointer"
      style={{
        backgroundColor: winner == "player1" ? '#4dab46' : '#151515'
      }}
      onClick={() => setWinner("player1")}
    >
      {challenge.player1.name}
    </div>
    <div
      className="p-4 pt-2 pb-2 cursor-pointer"
      style={{
        backgroundColor: winner == "player2" ? '#4dab46' : '#151515'
      }}
      onClick={() => setWinner("player2")}
    >
      {challenge.player2.name}
    </div>
    <div className="bg-[#151515] p-4 pt-2 pb-2">{challenge.game_name}</div>
    <button onClick={() => declareWinner(i)} className="bg-[#305fab] hover:bg-[#4870db] cursor-pointer p-4 pt-2 pb-2">Declare winner</button>
  </div>))}
  </div>
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/admin',
    component: Admin,
    getParentRoute: () => parentRoute,
  })
