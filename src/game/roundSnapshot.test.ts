import {
  clearRoomTestStore,
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
  recordWalletCredited,
  getRoundAuditTotals,
} from './roundAuditLedger';

import {
  createRoomRound,
  joinRoomPlayer,
  startRoomRound,
} from './roomRoundCoordinator';

import {
  buildRoundSnapshot,
} from './roundSnapshot';

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

createRoomRound(
  'SNAPSHOT-ROOM',
  3,
);

joinRoomPlayer(
  'SNAPSHOT-ROOM',
  'A',
  ['A1'],
);

joinRoomPlayer(
  'SNAPSHOT-ROOM',
  'B',
  ['B1'],
);

startRoomRound(
  'SNAPSHOT-ROOM',
  'SNAPSHOT-ROUND',
);

recordRoundCreated(
  'SNAPSHOT-ROUND',
);

recordRoundStarted(
  'SNAPSHOT-ROUND',
);

recordBallDrawn(
  'SNAPSHOT-ROUND',
  57,
);

recordSettlementPaid(
  'SNAPSHOT-ROUND',
  57,
  'bingo',
  227,
  12,
);

recordWalletCredited(
  'SNAPSHOT-ROUND',
  57,
  'A',
  'bingo',
  114,
  6,
);

recordWalletCredited(
  'SNAPSHOT-ROUND',
  57,
  'B',
  'bingo',
  113,
  6,
);

recordRoundClosed(
  'SNAPSHOT-ROUND',
  57,
);

const totals =
  getRoundAuditTotals(
    'SNAPSHOT-ROUND',
  );

const snapshot =
  buildRoundSnapshot(
    'SNAPSHOT-ROOM',
    'SNAPSHOT-ROUND',
    {
      roundId:
        'SNAPSHOT-ROUND',
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
      settlements: [],
      residualGold:
        423,
      residualBB:
        0,
      roundClosed:
        true,
    },
    227,
    12,
  );

assert(
  snapshot.roomStatus ===
      'running' &&
    snapshot.roundStatus ===
      'running',
  'Snapshot não refletiu o estado persistido da sala/rodada',
);

assert(
  snapshot.roundId ===
      'SNAPSHOT-ROUND' &&
    snapshot.prizePool ===
      650,
  'Identidade/pool do snapshot incorretos',
);

assert(
  snapshot.drawCount === 1 &&
    snapshot.lastNumber ===
      57,
  'Dados da bola incorretos',
);

assert(
  snapshot.playerCount ===
    2,
  'Contagem de jogadores incorreta',
);

assert(
  snapshot.totalGoldPaid ===
      227 &&
    snapshot.totalBBPaid ===
      12,
  'Totais pagos incorretos',
);

assert(
  snapshot.settlementCount ===
      1 &&
    snapshot.walletCreditCount ===
      2,
  'Contadores econômicos incorretos',
);

assert(
  snapshot.auditTotals.entries ===
      totals.entries &&
    snapshot.auditTotals.balls ===
      totals.balls &&
    snapshot.auditTotals.patterns ===
      totals.patterns &&
    snapshot.auditTotals.settlements ===
      totals.settlements &&
    snapshot.auditTotals.walletCredits ===
      totals.walletCredits &&
    snapshot.auditTotals.gold ===
      totals.gold &&
    snapshot.auditTotals.bb ===
      totals.bb &&
    snapshot.auditTotals.closed ===
      totals.closed,
  'Totais da auditoria não foram preservados',
);

assert(
  snapshot.audit.length === 7,
  'Snapshot deveria carregar 7 eventos de auditoria',
);

assert(
  snapshot.finished,
  'Snapshot deveria indicar rodada encerrada',
);

console.log(
  'roundSnapshot integration tests: OK',
);
