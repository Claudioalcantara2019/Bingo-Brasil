import {
  clearRoundStateTestStore,
  closeRound,
  createRound,
  getRoundState,
  recordDrawnNumber,
  startRound,
} from './roundStateEngine';

function assert(
  condition: boolean,
  message: string,
) {
  if (!condition) {
    throw new Error(message);
  }
}

clearRoundStateTestStore();

const created =
  createRound('STATE-ROUND-1');

assert(
  created.ok &&
    created.state.status === 'open',
  'Rodada não foi criada como open',
);

const started =
  startRound('STATE-ROUND-1');

assert(
  started.ok &&
    started.state.status === 'running',
  'Rodada não iniciou como running',
);

const number =
  recordDrawnNumber(
    'STATE-ROUND-1',
    57,
  );

assert(
  number.ok &&
    number.state.lastNumber === 57 &&
    number.state.drawCount === 1,
  'Número não foi registrado',
);

const closed =
  closeRound('STATE-ROUND-1');

assert(
  closed.ok &&
    closed.state.status === 'closed',
  'Rodada não foi fechada',
);

const afterClose =
  recordDrawnNumber(
    'STATE-ROUND-1',
    63,
  );

assert(
  !afterClose.ok &&
    afterClose.reason === 'already-closed',
  'Rodada fechada aceitou nova bola',
);

const closeAgain =
  closeRound('STATE-ROUND-1');

assert(
  closeAgain.ok &&
    closeAgain.reason === 'already-closed',
  'Fechamento repetido não foi idempotente',
);

const duplicateCreate =
  createRound('STATE-ROUND-1');

assert(
  duplicateCreate.ok,
  'Reabertura da rodada deveria ser protegida',
);

const invalid =
  recordDrawnNumber(
    'STATE-ROUND-1',
    76,
  );

assert(
  !invalid.ok &&
    invalid.reason === 'invalid-number',
  'Número 76 deveria ser rejeitado',
);

assert(
  getRoundState('STATE-ROUND-1')
    ?.status === 'closed',
  'Estado final deveria continuar closed',
);

console.log(
  'roundStateEngine tests: OK',
);
