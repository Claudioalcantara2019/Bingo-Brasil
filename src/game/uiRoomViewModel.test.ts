import {
  buildUiRoomViewModel,
} from './uiRoomViewModel';

import type {
  UiRoomState,
} from './uiRoomController';

function assert(
  condition: boolean,
  message: string,
) {
  if (!condition) {
    throw new Error(message);
  }
}

const state: UiRoomState = {
  roomId:
    'VM-ROOM',
  roundId:
    'VM-ROUND',
  playerCount:
    3,

  cardsByPlayer: {
    A: ['A1'],
    B: ['B1'],
    C: ['C1'],
  },

  ready:
    true,

  view: {
    roomStatus:
      'closed',
    roundStatus:
      'closed',
    blocked:
      false,
    blockedReason:
      'none',
    finished:
      true,
    totalGoldPaid:
      225,
    totalBBPaid:
      12,

    prizes: [
      {
        key:
          'terno',
        label:
          '🥉 Terno',
        winners:
          1,
        paid:
          19,
        remaining:
          46,
        status:
          'paid',
      },
      {
        key:
          'quadra',
        label:
          '🥈 Quadra',
        winners:
          0,
        paid:
          0,
        remaining:
          65,
        status:
          'waiting',
      },
      {
        key:
          'diagonal',
        label:
          '↘️ Diagonal',
        winners:
          0,
        paid:
          0,
        remaining:
          65,
        status:
          'waiting',
      },
      {
        key:
          'linha',
        label:
          '🟡 Linha',
        winners:
          0,
        paid:
          0,
        remaining:
          98,
        status:
          'waiting',
      },
      {
        key:
          'dupla',
        label:
          '🏆 Linha dupla',
        winners:
          0,
        paid:
          0,
        remaining:
          130,
        status:
          'waiting',
      },
      {
        key:
          'bingo',
        label:
          '🎱 Bingo',
        winners:
          3,
        paid:
          227,
        remaining:
          0,
        status:
          'paid',
      },
    ],
  },
};

const view =
  buildUiRoomViewModel(
    state,
  );

assert(
  view.roomStatusText ===
    'Sala encerrada',
  'Texto da sala incorreto',
);

assert(
  view.roundStatusText ===
    'Rodada encerrada',
  'Texto da rodada incorreto',
);

assert(
  view.connectionText ===
    'Conectado',
  'Texto de conexão incorreto',
);

assert(
  view.playerCountText ===
    '3 jogadores',
  'Contador de jogadores incorreto',
);

assert(
  view.roundIdText ===
    'VM-ROUND',
  'Identificador da rodada incorreto',
);

assert(
  view.totalGoldPaidText ===
    '225' &&
    view.totalBBPaidText ===
      '12',
  'Totais formatados incorretamente',
);

assert(
  view.bannerText ===
    '🎱 BINGO — rodada encerrada',
  'Banner final incorreto',
);

const bingo =
  view.prizes.find(
    (row) =>
      row.key ===
      'bingo',
  );

assert(
  bingo?.statusText ===
      'Pago' &&
    bingo?.winnersText ===
      '3 vencedores' &&
    bingo?.paidText ===
      '227' &&
    bingo?.remainingText ===
      '0' &&
    bingo?.highlighted,
  'Linha de Bingo incorreta',
);

assert(
  view.prizes.length ===
    6,
  'ViewModel deveria expor 6 categorias',
);

console.log(
  'uiRoomViewModel tests: OK',
);
