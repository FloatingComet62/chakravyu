import { DatabaseContext } from '@/contexts/database'
import type { RootRoute } from '@tanstack/react-router'
import { createRoute, useNavigate } from '@tanstack/react-router'
import { useContext, useEffect, useState } from 'react'

function isTarget(card, suit) {
  const card_suit = Math.round(card / 13);
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
    setChallenges(res.map(x => ({
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
  
  return <div className="w-screen min-h-screen flex flex-col justify-center items-center p-8 bg-[#202020] text-white flex flex-col gap-4 text-center overflow-scroll">
  <div className="text-5xl">Challenges</div>
  {challenges.map((challenge, i) => (<div className="flex gap-4 bg-[#303030] p-8 pt-4 pb-4">
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
