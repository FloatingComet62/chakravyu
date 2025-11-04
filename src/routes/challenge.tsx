import { DatabaseContext } from '@/contexts/database';
import { cardsStore, gameStore } from '@/contexts/store';
import { createRoute, useNavigate } from '@tanstack/react-router'
import type { RootRoute } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store';
import { useContext, useEffect, useState } from 'react';
import { suits, Cardn } from '@/components/Card';

function Challenge() {
  const { cards, cardsFetched } = useStore(cardsStore);
  const gameState = useStore(gameStore);
  const pb = useContext(DatabaseContext);
  const navigate = useNavigate();
  const [games, setGames] = useState<{ id: string; name: string; suits: number[] }[]>([]);
  const [selectedGame, setSelectedGame] = useState("");

  function sendGame(id: string) {
    if (!pb || !gameState.challengeRecordId) return;
    pb.collection('challenges').update(gameState.challengeRecordId, {
      game: id
    });
  }

  function listenForGame() {
    if (!pb || !gameState.challengeRecordId) return;
    pb.collection('challenges').subscribe(gameState.challengeRecordId, (e) => {
      if (!e.record.game) return;
      setSelectedGame(e.record.game);
    })
  }

  useEffect(() => {(async () => {
    if (!pb || !pb.authStore.record) { navigate({ to: '/' }); return; }
    if (!gameState.challengeRecordId) { navigate({ to: '/game' }); return; }
    if (gameState.gameSelected) {
      setSelectedGame(gameState.gameSelected);
    }
    if (!cardsFetched) {
      const res = await pb.collection('user_cards').getFullList();
      cardsStore.setState({
        cards: res.map(item => item.card),
        cardsFetched: Date.now(),
      });
    }
    if (pb.authStore.record.id != gameState.accepter) {
      listenForGame();
    }
    const res = await pb.collection('games').getFullList();
    setGames(res.map(x => ({ id: x.id, name: x.name, suits: [x.target_suit1, x.target_suit2] })));
  })()}, []);
  return <div className="w-screen min-h-screen flex flex-col justify-center items-center p-8 bg-[#202020] text-white flex flex-col gap-4 text-center">
    <div className="text-7xl">Choose game</div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {games.map(game => <div className="p-16 bg-[#151515] flex flex-col items-center" style={{
        cursor: pb!.authStore.record!.id == gameState.accepter ? 'pointer' : 'not-allowed',
        backgroundColor: game.id == selectedGame ? '#11dd11' : '#151515'
      }} onClick={() => {
        if (selectedGame.length > 0) return;
        if (pb!.authStore.record!.id != gameState.accepter) return;
        setSelectedGame(game.id)
        sendGame(game.id);
      }}>
        <div className="text-5xl mb-4">{game.name}</div>
        <div className="text-lg text-[#999999]">Put decks on the line</div>
        <div className="flex gap-4 h-full">{game.suits.map((i) => {
          const c = cards.filter(idx => Math.round(idx / 13) == i);
          if (c.length == 0) {
            return <div className="flex flex-col justify-between">
              <div>{suits[i]}</div>
              <div className="text-4xl">No cards</div>
              <div></div>
            </div>
          }
          const card = c[0];
          return <div className="flex flex-col">
            <div>{suits[i]}</div>
            <div className="flex flex-col">
              <Cardn n={card} />
              {c.length > 1 ? <div>x{c.length}</div> : null}
            </div>
          </div>
        })}</div>
      </div>)}
    </div>
  </div>
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/challenge',
    component: Challenge,
    getParentRoute: () => parentRoute,
  })
