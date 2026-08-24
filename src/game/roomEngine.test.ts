import {
  clearRoomTestStore,
  closeRoom,
  createRoom,
  joinRoom,
  leaveRoom,
  startRoom,
} from './roomEngine';

function assert(
  condition: boolean,
  message: string,
) {
  if (!condition) {
    throw new Error(message);
  }
}

clearRoomTestStore();

const created =
  createRoom(
    'ROOM-1',
    2,
  );

assert(
  created.ok &&
    created.state.status ===
      'waiting',
  'Sala não foi criada como waiting',
);

const a =
  joinRoom(
    'ROOM-1',
    'A',
    ['A-CARD-1'],
  );

assert(
  a.ok &&
    a.state.players.length ===
      1,
  'Jogador A não entrou',
);

const b =
  joinRoom(
    'ROOM-1',
    'B',
    ['B-CARD-1', 'B-CARD-2'],
  );

assert(
  b.ok &&
    b.state.players.length ===
      2,
  'Jogador B não entrou',
);

const duplicate =
  joinRoom(
    'ROOM-1',
    'B',
    ['B-CARD-3'],
  );

assert(
  duplicate.ok &&
    duplicate.reason ===
      'already-joined',
  'Jogador duplicado não foi protegido',
);

const full =
  joinRoom(
    'ROOM-1',
    'C',
    ['C-CARD-1'],
  );

assert(
  !full.ok &&
    full.reason ===
      'room-full',
  'Sala cheia aceitou terceiro jogador',
);

const started =
  startRoom(
    'ROOM-1',
    'ROUND-1',
  );

assert(
  started.ok &&
    started.state.status ===
      'running' &&
    started.state.roundId ===
      'ROUND-1',
  'Sala não iniciou corretamente',
);

const lateJoin =
  joinRoom(
    'ROOM-1',
    'C',
    ['C-CARD-1'],
  );

assert(
  !lateJoin.ok &&
    lateJoin.reason ===
      'cannot-join',
  'Sala running aceitou novo jogador',
);

const closed =
  closeRoom(
    'ROOM-1',
  );

assert(
  closed.ok &&
    closed.state.status ===
      'closed',
  'Sala não fechou',
);

const closeAgain =
  closeRoom(
    'ROOM-1',
  );

assert(
  closeAgain.ok &&
    closeAgain.reason ===
      'already-closed',
  'Fechamento repetido da sala não foi idempotente',
);

const waiting =
  createRoom(
    'ROOM-2',
    5,
  );

assert(
  waiting.ok,
  'Sala 2 não foi criada',
);

const join2 =
  joinRoom(
    'ROOM-2',
    'Z',
    ['Z-1', 'Z-1', 'Z-2'],
  );

assert(
  join2.state.players[0].cardIds
    .length === 2,
  'Cartelas duplicadas não foram filtradas',
);

const leave =
  leaveRoom(
    'ROOM-2',
    'Z',
  );

assert(
  leave.ok &&
    leave.state.players.length ===
      0,
  'Jogador não saiu da sala waiting',
);

console.log(
  'roomEngine tests: OK',
);
