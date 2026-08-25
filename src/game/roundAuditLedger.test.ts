import {
  clearRoundAuditTestStore,
  getRoundAudit,
  getRoundAuditTotals,
  recordBallDrawn,
  recordPatternDetected,
  recordRoundClosed,
  recordRoundCreated,
  recordRoundStarted,
  recordSettlementPaid,
  recordWalletCredited,
} from './roundAuditLedger';

function assert(
  condition: boolean,
  message: string,
) {
  if (!condition) {
    throw new Error(message);
  }
}

clearRoundAuditTestStore();

recordRoundCreated(
  'AUDIT-ROUND-1',
);

recordRoundStarted(
  'AUDIT-ROUND-1',
);

recordBallDrawn(
  'AUDIT-ROUND-1',
  57,
);

recordPatternDetected(
  'AUDIT-ROUND-1',
  57,
  'PLAYER-A',
  'bingo',
);

recordSettlementPaid(
  'AUDIT-ROUND-1',
  57,
  'bingo',
  225,
  12,
);

recordWalletCredited(
  'AUDIT-ROUND-1',
  57,
  'PLAYER-A',
  'bingo',
  75,
  4,
);

recordWalletCredited(
  'AUDIT-ROUND-1',
  57,
  'PLAYER-B',
  'bingo',
  75,
  4,
);

recordWalletCredited(
  'AUDIT-ROUND-1',
  57,
  'PLAYER-C',
  'bingo',
  75,
  4,
);

recordRoundClosed(
  'AUDIT-ROUND-1',
  57,
);

const audit =
  getRoundAudit(
    'AUDIT-ROUND-1',
  );

assert(
  audit.length === 9,
  'Auditoria deveria ter 9 eventos',
);

assert(
  audit[0].type ===
    'round-created' &&
    audit[8].type ===
      'round-closed',
  'Ordem básica da auditoria incorreta',
);

const totals =
  getRoundAuditTotals(
    'AUDIT-ROUND-1',
  );

assert(
  totals.entries === 9,
  'Total de eventos incorreto',
);

assert(
  totals.balls === 1,
  'Quantidade de bolas incorreta',
);

assert(
  totals.patterns === 1,
  'Quantidade de padrões incorreta',
);

assert(
  totals.settlements === 1,
  'Quantidade de liquidações incorreta',
);

assert(
  totals.walletCredits === 3,
  'Quantidade de créditos incorreta',
);

assert(
  totals.gold === 450 &&
    totals.bb === 24,
  'Totais auditados incorretos',
);

assert(
  totals.closed,
  'Auditoria deveria marcar rodada fechada',
);

console.log(
  'roundAuditLedger tests: OK',
);
