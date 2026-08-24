import {
  clearRoomTestStore,
} from './roomEngine';

import {
  clearRoundStateTestStore,
} from './roundStateEngine';

import {
  clearWalletLedgerTestStore,
} from './walletLedger';

import {
  createRoomRound,
  getRoomRoundState,
  joinRoomPlayer,
  startRoomRound,
  closeRoomRound,
} from './roomRoundCoordinator';

function assert(
  condition: boolean,
  message: string,
) {
  if (!condition) {
    throw new Error(message);
  }
}

clearRoomTestStore();
clearRoundStateTestStore();
clearWalletLedgerTestStore();

const created =
  createRoomRound(
    'ROOM-ROUND-1',
    3,
  );

assert(
  created.ok &&
    created.state.room?.status ===
      'waiting',
  'Sala/rodada não foram criadas corretamente',
);

const a =
  joinRoomPlayer(
    'ROOM-ROUND-1',
    'A',
    ['A-CARD'],
  );

assert(
  a.ok &&
    a.state.room?.players.length ===
      1,
  'Jogador A não entrou',
);

const b =
  joinRoomPlayer(
    'ROOM-ROUND-1',
    'B',
    ['B-CARD'],
  );

assert(
  b.ok &&
    b.state.room?.players.length ===
      2,
  'Jogador B não entrou',
);

const started =
  startRoomRound(
    'ROOM-ROUND-1',
    'ROUND-1',
  );

assert(
  started.ok &&
    started.state.room?.status ===
      'running' &&
    started.state.roundStatus ===
      'running',
  'Sala e rodada não ficaram running',
);

const again =
  startRoomRound(
    'ROOM-ROUND-1',
    'ROUND-1',
  );

assert(
  again.ok &&
    (
      again.reason ===
        'round-already-running' ||
      again.reason ===
        'already-running'
    ),
  'Início repetido não foi idempotente',
);

const late =
  joinRoomPlayer(
    'ROOM-ROUND-1',
    'C',
    ['C-CARD'],
  );

assert(
  !late.ok &&
    late.reason ===
      'cannot-join',
  'Jogador entrou depois do início',
);

const closed =
  closeRoomRound(
    'ROOM-ROUND-1',
  );

assert(
  closed.ok &&
    closed.state.room?.status ===
      'closed' &&
    closed.state.roundStatus ===
      'closed',
  'Sala e rodada não fecharam juntas',
);

const closedAgain =
  closeRoomRound(
    'ROOM-ROUND-1',
  );

assert(
  closedAgain.ok &&
    closedAgain.reason ===
      'already-closed',
  'Fechamento repetido não foi idempotente',
);

const finalState =
  getRoomRoundState(
    'ROOM-ROUND-1',
  );

assert(
  finalState.room?.status ===
      'closed' &&
    finalState.roundStatus ===
      'closed',
  'Estado final sala/rodada incorreto',
);

console.log(
  'roomRoundCoordinator tests: OK',
);
