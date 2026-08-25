import {
  buildUiRoundSummary,
} from './uiGameBridge';

import type {
  RoomGameEventResult,
} from './roomGameEngine';

function assert(
  condition: boolean,
  message: string,
) {
  if (!condition) {
    throw new Error(message);
  }
}

const blocked: RoomGameEventResult = {
  ok: false,
  reason: 'round-closed',
  roomStatus: 'closed',
  roundStatus: 'closed',
  flow: null,
};

const blockedView =
  buildUiRoundSummary(
    blocked,
  );

assert(
  blockedView.blocked,
  'Bloqueio não foi convertido para UI',
);

assert(
  blockedView.blockedReason ===
    'round-closed',
  'Motivo do bloqueio incorreto',
);

const processed: RoomGameEventResult = {
  ok: true,
  reason:
    'processed-and-closed',
  roomStatus: 'closed',
  roundStatus: 'closed',
  flow: {
    finished: true,

    round: {
      roundId:
        'UI-ROUND-1',
      triggerNumber:
        57,
      prizePool:
        650,

      categoryPools: {
        terno: 65,
        quadra: 65,
        diagonal: 65,
        linha: 98,
        dupla: 130,
        bingo: 227,
      },

      categories: [
        {
          category: 'terno',
          reservedPool: 65,
          winners: [
            {
              userId: 'A',
              cardId: 'A1',
            },
          ],
          paidPool: 19,
          residual: 46,
        },

        {
          category: 'quadra',
          reservedPool: 65,
          winners: [],
          paidPool: 0,
          residual: 65,
        },

        {
          category: 'diagonal',
          reservedPool: 65,
          winners: [],
          paidPool: 0,
          residual: 65,
        },

        {
          category: 'linha',
          reservedPool: 98,
          winners: [],
          paidPool: 0,
          residual: 98,
        },

        {
          category: 'dupla',
          reservedPool: 130,
          winners: [],
          paidPool: 0,
          residual: 130,
        },

        {
          category: 'bingo',
          reservedPool: 227,
          winners: [
            {
              userId: 'B',
              cardId: 'B1',
            },
            {
              userId: 'C',
              cardId: 'C1',
            },
          ],
          paidPool: 227,
          residual: 0,
        },
      ],

      settlements: [
        {
          roundId:
            'UI-ROUND-1',
          settlementKey:
            'UI-ROUND-1:terno:57',
          category:
            'terno',
          status:
            'paid',
          totalGold:
            19,
          totalBB:
            0,
          payouts: [
            {
              userId: 'A',
              cardId: 'A1',
              gold: 19,
              bb: 0,
              category:
                'terno',
              triggerNumber:
                57,
            },
          ],
          goldResidual:
            0,
          bbResidual:
            0,
        },

        {
          roundId:
            'UI-ROUND-1',
          settlementKey:
            'UI-ROUND-1:bingo:57',
          category:
            'bingo',
          status:
            'paid',
          totalGold:
            227,
          totalBB:
            12,
          payouts: [
            {
              userId: 'B',
              cardId: 'B1',
              gold: 114,
              bb: 6,
              category:
                'bingo',
              triggerNumber:
                57,
            },
            {
              userId: 'C',
              cardId: 'C1',
              gold: 113,
              bb: 6,
              category:
                'bingo',
              triggerNumber:
                57,
            },
          ],
          goldResidual:
            0,
          bbResidual:
            0,
        },
      ],

      residualGold:
        404,
      residualBB:
        0,
      roundClosed:
        true,
    },

    payout: {
      status:
        'processed',
      roundId:
        'UI-ROUND-1',
      credits: [],
      totalGoldCredited:
        246,
      totalBBCredited:
        12,
    },
  },
};

const view =
  buildUiRoundSummary(
    processed,
  );

assert(
  view.finished &&
    view.roomStatus ===
      'closed' &&
    view.roundStatus ===
      'closed',
  'Estado final da UI incorreto',
);

assert(
  view.totalGoldPaid === 246 &&
    view.totalBBPaid === 12,
  'Totais pagos incorretos',
);

const terno =
  view.prizes.find(
    (row) =>
      row.key ===
      'terno',
  );

assert(
  terno?.winners === 1 &&
    terno.paid === 19 &&
    terno.remaining === 46 &&
    terno.status ===
      'paid',
  'Linha de Terno da UI incorreta',
);

const bingo =
  view.prizes.find(
    (row) =>
      row.key ===
      'bingo',
  );

assert(
  bingo?.winners === 2 &&
    bingo.paid === 227 &&
    bingo.remaining === 0 &&
    bingo.status ===
      'paid',
  'Linha de Bingo da UI incorreta',
);

console.log(
  'uiGameBridge tests: OK',
);
