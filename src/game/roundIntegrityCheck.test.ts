import {
  clearRoomTestStore,
  createRoom,
  joinRoom,
} from './roomEngine';

import {
  clearRoundStateTestStore,
} from './roundStateEngine';

import {
  clearRoundAuditTestStore,
  recordBallDrawn,
  recordRoundClosed,
  recordRoundCreated,
  recordRoundStarted,
  recordSettlementPaid,
} from './roundAuditLedger';

import {
  createRoomRound,
  startRoomRound,
  closeRoomRound,
} from './roomRoundCoordinator';

import {
  checkRoundIntegrity,
} from './roundIntegrityCheck';

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
clearRoundAuditTestStore();

createRoom(
  'INTEGRITY-ROOM',
  3,
);

joinRoom(
  'INTEGRITY-ROOM',
  'A',
  ['A1'],
);

createRoomRound(
  'INTEGRITY-ROOM',
  3,
);

startRoomRound(
  'INTEGRITY-ROOM',
  'INTEGRITY-ROUND',
);

recordRoundCreated(
  'INTEGRITY-ROUND',
);

recordRoundStarted(
  'INTEGRITY-ROUND',
);

recordBallDrawn(
  'INTEGRITY-ROUND',
  57,
);

recordSettlementPaid(
  'INTEGRITY-ROUND',
  57,
  'bingo',
  227,
  12,
);

recordRoundClosed(
  'INTEGRITY-ROUND',
  57,
);

const validSettlement = {
  roundId:
    'INTEGRITY-ROUND',
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
  categories: [],
  settlements: [
    {
      roundId:
        'INTEGRITY-ROUND',
      settlementKey:
        'INTEGRITY-ROUND:bingo:57',
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
            227,
          bb:
            12,
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
    423,
  residualBB:
    0,
  roundClosed:
    false,
};

const first =
  checkRoundIntegrity(
    'INTEGRITY-ROOM',
    'INTEGRITY-ROUND',
    validSettlement,
  );

assert(
  first.ok,
  'Rodada válida deveria passar',
);

assert(
  first.economy.ok,
  'Economia válida deveria passar',
);

assert(
  first.audit.entries ===
    5,
  'Auditoria deveria ter 5 eventos',
);

assert(
  first.auditEntries.length ===
    5,
  'Detalhamento da auditoria incorreto',
);

assert(
  first.warnings.length ===
    0,
  'Rodada running sem inconsistência não deveria gerar warning',
);

/*
 * Fecha a sala/rodada e cria o resultado econômico correspondente.
 */
closeRoomRound(
  'INTEGRITY-ROOM',
);

const closedSettlement = {
  ...validSettlement,
  roundClosed:
    true,
};

const second =
  checkRoundIntegrity(
    'INTEGRITY-ROOM',
    'INTEGRITY-ROUND',
    closedSettlement,
  );

assert(
  second.ok,
  'Rodada fechada íntegra deveria passar',
);

assert(
  second.room ===
      'closed' &&
    second.round ===
      'closed',
  'Estado fechado incorreto',
);

const wrongRound =
  checkRoundIntegrity(
    'INTEGRITY-ROOM',
    'OTHER-ROUND',
    closedSettlement,
  );

assert(
  !wrongRound.ok,
  'Rodada incorreta deveria falhar',
);

assert(
  wrongRound.errors.some(
    (error) =>
      error.includes(
        'outra rodada',
      ),
  ),
  'Erro de vínculo de rodada não foi identificado',
);

console.log(
  'roundIntegrityCheck integration tests: OK',
);
