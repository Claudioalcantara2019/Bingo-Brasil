import type {
  GameFlowResult,
} from './gameFlowEngine';

import {
  clearRoundAuditTestStore,
  getRoundAudit,
  getRoundAuditTotals,
} from './roundAuditLedger';

import {
  auditGameFlowEvent,
} from './roundAuditProcessor';

function assert(
  condition: boolean,
  message: string,
) {
  if (!condition) {
    throw new Error(message);
  }
}

clearRoundAuditTestStore();

const flow =
  {
    finished: true,

    round: {
      roundId:
        'AUDIT-PROCESS-1',

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
          category:
            'bingo' as const,
          reservedPool:
            227,
          winners: [
            {
              userId:
                'A',
              cardId:
                'A1',
            },
            {
              userId:
                'B',
              cardId:
                'B1',
            },
          ],
          paidPool:
            227,
          residual:
            0,
        },
      ],

      settlements: [
        {
          roundId:
            'AUDIT-PROCESS-1',
          settlementKey:
            'AUDIT-PROCESS-1:bingo:57',
          category:
            'bingo' as const,
          status:
            'paid' as const,
          totalGold:
            227,
          totalBB:
            12,
          payouts: [
            {
              userId:
                'A',
              cardId:
                'A1',
              gold:
                114,
              bb:
                6,
              category:
                'bingo' as const,
              triggerNumber:
                57,
            },
            {
              userId:
                'B',
              cardId:
                'B1',
              gold:
                113,
              bb:
                6,
              category:
                'bingo' as const,
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
        0,
      residualBB:
        0,
      roundClosed:
        true,
    },

    payout: {
      status:
        'processed' as const,
      roundId:
        'AUDIT-PROCESS-1',
      credits: [],
      totalGoldCredited:
        227,
      totalBBCredited:
        12,
    },
  } satisfies GameFlowResult;

auditGameFlowEvent(
  'AUDIT-PROCESS-1',
  57,
  flow,
);

const audit =
  getRoundAudit(
    'AUDIT-PROCESS-1',
  );

assert(
  audit.length === 9,
  'Auditoria deveria ter 9 eventos',
);

assert(
  audit[0].type ===
      'round-created' &&
    audit[1].type ===
      'round-started' &&
    audit[2].type ===
      'ball-drawn',
  'Cabeçalho da auditoria incorreto',
);

assert(
  audit.filter(
    (entry) =>
      entry.type ===
      'pattern-detected',
  ).length === 2,
  'Deveria haver 2 detecções de Bingo',
);

assert(
  audit.filter(
    (entry) =>
      entry.type ===
      'settlement-paid',
  ).length === 1,
  'Deveria haver 1 liquidação',
);

assert(
  audit.filter(
    (entry) =>
      entry.type ===
      'wallet-credited',
  ).length === 2,
  'Deveria haver 2 créditos de carteira',
);

assert(
  audit[audit.length - 1].type ===
    'round-closed',
  'Rodada não terminou com evento de fechamento',
);

const totals =
  getRoundAuditTotals(
    'AUDIT-PROCESS-1',
  );

assert(
  totals.balls === 1 &&
    totals.patterns === 2 &&
    totals.settlements === 1 &&
    totals.walletCredits === 2 &&
    totals.closed,
  'Totais da auditoria incorretos',
);

assert(
  totals.gold ===
      227 + 227 &&
    totals.bb ===
      12 + 12,
  'Totais auditados incorretos',
);

console.log(
  'roundAuditProcessor integration tests: OK',
);
