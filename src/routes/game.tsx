import { DatabaseContext } from '@/contexts/database';
import { cardsStore, gameStore } from '@/contexts/store';
import { useForm, useStore } from '@tanstack/react-form';
import { createRoute, useNavigate } from '@tanstack/react-router'
import type { RootRoute } from '@tanstack/react-router'
import { useContext, useEffect, useState } from 'react';
import { Cardn } from '../components/Card'
import z from 'zod';

const letters = "QWERTYUIOPASDFGHJKLZXCVBNM";
const CODE_SIZE = 4;
function generateCode() {
  let output = "";
  for (let i = 0; i < CODE_SIZE; i++) {
    output += letters[Math.round(Math.random() * (letters.length - 1))]
  }
  return output;
}

const codeSchema = z.object({
  code: z.string()
    // .length(4, 'Code should be 4 letters long')
    .regex(/^[A-Z]{4}$/, { message: 'Code must contain only 4 capital letters'}),
});

function Game() {
  const { cards, cardsFetched } = useStore(cardsStore);
  const gameState = useStore(gameStore);
  const [showReceiveModel, setShowReceiveModel] = useState(false);
  const [showSendModel, setShowSendModel] = useState(false);
  const [code, setCode] = useState("");
  const pb = useContext(DatabaseContext);
  const navigate = useNavigate();
  const codeForm = useForm({
    defaultValues: {
      code: ""
    },
    validators: {
      onBlur: codeSchema
    },
    onSubmit: async ({ value }) => {
      if (!pb || !pb.authStore.record) return;
      const record = await pb.collection('challenges').getFirstListItem(`code="${value.code}"`);
      await pb.collection('challenges').update(record.id, {
        code: value.code, // required for verification of access
        accepter: pb.authStore.record.id,
      });
      gameStore.setState({
        ...gameState,
        challengeRecordId: record.id,
        accepter: pb.authStore.record.id,
      })
      navigate({ to: '/challenge' });
    },
  })

  useEffect(() => {(async () => {
    if (!pb || !pb.authStore.record) { navigate({ to: '/' }); return; }
    if (cardsFetched) return;
    const res = await pb.collection('user_cards').getFullList();
    cardsStore.setState({
      cards: res.map(item => item.card),
      cardsFetched: Date.now(),
    });

    const ongoing_challenges = await pb.collection('challenges').getFullList({
      filter: `receiver=\"${pb.authStore.record.id}\" && accepter!=null`,
    });
    const ongoing_challenge = ongoing_challenges[0]
    gameStore.setState({
      challengeRecordId: ongoing_challenge.id,
      accepter: ongoing_challenge.accepter,
      gameSelected: ongoing_challenge.game,
      gameState: null as any,
    });
    navigate({ to: '/challenge' })
  })()}, []);

  async function sendChallenge() {
    if (!pb) return;
    setShowSendModel(true);
  }
  async function receiveChallenge() {
    if (!pb || !pb.authStore.record) return;
    const code = generateCode();
    setCode(code);
    setShowReceiveModel(true);
    const record = await pb.collection('challenges').create({
      code,
      receiver: pb.authStore.record.id,
    });
    pb.collection('challenges').subscribe(record.id, (e) => {
      if (!e.record.accepter) return;
      gameStore.setState({
        ...gameState,
        challengeRecordId: record.id,
        accepter: e.record.accepter,
      });
      navigate({ to: '/challenge' });
    })
  }

  return <div className="w-screen min-h-screen flex justify-center items-center p-8 bg-[#202020] text-white flex flex-col gap-4 text-center">
  <div className="flex w-screen absolute top-0 left-0">
    <button onClick={() => sendChallenge()} className="cursor-pointer hover:opacity-90 bg-[#32a852] p-4 w-1/2">Send Challenge</button>
    <button onClick={() => receiveChallenge()} className="cursor-pointer hover:opacity-90 bg-[#0378fc] p-4 w-1/2">Receive Challenge</button>
  </div>
  <h1 className="text-8xl">Your cards</h1>
  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
    {cards.map(i => <Cardn n={i} />)}
  </div>
  {showReceiveModel ? <div className="flex flex-col gap-8 items-center absolute w-1/2 h-1/2 bg-[#151515] text-white">
    <button onClick={() => {
      setShowReceiveModel(false);
      setCode("");
    }} className="cursor-pointer hover:opacity-90 bg-[#0378fc] p-4 w-full">
      Close
    </button>
    <div className="text-3xl">Code</div>
    <div className="text-8xl font-bold">{code}</div>
  </div> : null}
  {showSendModel ? <div className="flex flex-col gap-8 items-center absolute w-1/2 h-1/2 bg-[#151515] text-white">
    <button onClick={() => {
      setShowSendModel(false);
      setCode("");
    }} className="cursor-pointer hover:opacity-90 bg-[#0378fc] p-4 w-full">
      Close
    </button>
    <form className="flex flex-col gap-8" onSubmit={(e) => {
      e.preventDefault();
      e.stopPropagation();
      codeForm.handleSubmit();
    }}>
      <codeForm.Field name="code">
        {(field) => <div className="flex flex-col gap-2 items-start">
          <label htmlFor={field.name} className="text-lg">Enter Code</label>
          <input
            className="bg-[#efefef] text-black p-2 text-center outline-none rounded-sm"
            id={field.name}
            name={field.name}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
            {field.state.meta.isTouched && !field.state.meta.isValid ? (
              <div className="flex flex-col gap-2 text-sm text-[#ff0000]">{field.state.meta.errors.map(x => <div>{x!.message}</div>)}</div>
            ) : null}
            {field.state.meta.isValidating ? 'Validating...' : null}
        </div>}
      </codeForm.Field>
      <codeForm.Subscribe selector={(state) => [
        state.canSubmit,
        state.isSubmitting
      ]}>
        {([canSubmit, isSubmitting]) => <div className="flex justify-center gap-4">
          <button className="cursor-pointer bg-[#101010] hover:bg-[#303030] p-4 pt-2 pb-2 rounded-sm" type="submit" disabled={!canSubmit}>
            {isSubmitting ? '...' : 'Submit'}
          </button>
          <button
          className="cursor-pointer bg-[#101010] hover:bg-[#303030] p-4 pt-2 pb-2 rounded-sm"
            type="reset"
            onClick={(e) => {
              // Avoid unexpected resets of form elements (especially <select> elements)
              e.preventDefault()
              codeForm.reset()
            }}
          >
            Reset
          </button>
        </div>}
      </codeForm.Subscribe>
    </form>
  </div> : null}
  </div>
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/game',
    component: Game,
    getParentRoute: () => parentRoute,
  })
