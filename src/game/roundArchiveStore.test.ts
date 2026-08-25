import {
  clearRoomArchiveStoreTestStore,
  getArchivedRoundCount,
  getRoundArchive,
  listRoomArchives,
  listRoundArchives,
  saveRoundArchive,
} from './roundArchiveStore';

function assert(
  condition: boolean,
  message: string,
) {
  if (!condition) {
    throw new Error(message);
  }
}

clearRoomArchiveStoreTestStore();

const archive = {
  archiveId:
    'ARCHIVE-1',
  roomId:
    'ROOM-1',
  roundId:
    'ROUND-1',

  snapshot: {
    roomId:
      'ROOM-1',
    roundId:
      'ROUND-1',
    roomStatus:
      'closed' as const,
    roundStatus:
      'closed' as const,
    lastNumber:
      57,
    drawCount:
      20,
    playerCount:
      3,
    prizePool:
      650,
    residualGold:
      423,
    residualBB:
      0,
    finished:
      true,
    totalGoldPaid:
      227,
    totalBBPaid:
      12,
    settlementCount:
      1,
    walletCreditCount:
      3,
    auditTotals: {
      entries:
        7,
      gold:
        454,
      bb:
        24,
      balls:
        1,
      patterns:
        0,
      settlements:
        1,
      walletCredits:
        3,
      closed:
        true,
    },
    audit: [],
  },

  receipt: {
    receiptId:
      'RECEIPT-1',
    roomId:
      'ROOM-1',
    roundId:
      'ROUND-1',
    triggerNumber:
      57,
    playerCount:
      3,
    totalGoldPaid:
      227,
    totalBBPaid:
      12,
    residualGold:
      423,
    residualBB:
      0,
    auditEntries:
      7,
    settlementCount:
      1,
    walletCreditCount:
      3,
    integrityOk:
      true,
    closedAt:
      Date.now(),
    closingReason:
      'bingo' as const,
  },

  integrity: {
    ok:
      true,
    room:
      'closed' as const,
    round:
      'closed' as const,
    economy: {
      ok:
        true,
      prizePool:
        650,
      paidGold:
        227,
      residualGold:
        423,
      expectedGoldTotal:
        650,
      paidBB:
        12,
      residualBB:
        0,
      expectedBBTotal:
        12,
      errors: [],
    },
    audit: {
      entries:
        7,
      gold:
        454,
      bb:
        24,
      balls:
        1,
      patterns:
        0,
      settlements:
        1,
      walletCredits:
        3,
      closed:
        true,
    },
    errors: [],
    warnings: [],
    auditEntries: [],
  },

  archivedAt:
    1000,
};

const first =
  saveRoundArchive(
    archive,
  );

assert(
  first.ok &&
    first.reason ===
      'saved',
  'Primeiro arquivo não foi salvo',
);

assert(
  getArchivedRoundCount() ===
    1,
  'Quantidade de arquivos incorreta',
);

const duplicate =
  saveRoundArchive(
    archive,
  );

assert(
  duplicate.ok &&
    duplicate.reason ===
      'already-exists',
  'Duplicação da rodada não foi protegida',
);

assert(
  getArchivedRoundCount() ===
    1,
  'Duplicação aumentou o armazenamento',
);

const loaded =
  getRoundArchive(
    'ROUND-1',
  );

assert(
  loaded?.roundId ===
      'ROUND-1' &&
    loaded?.roomId ===
      'ROOM-1',
  'Arquivo recuperado incorretamente',
);

assert(
  loaded !== archive,
  'Store deveria devolver cópia',
);

const roomList =
  listRoomArchives(
    'ROOM-1',
  );

assert(
  roomList.length ===
    1,
  'Lista por sala incorreta',
);

const all =
  listRoundArchives();

assert(
  all.length ===
      1 &&
    all[0].roundId ===
      'ROUND-1',
  'Lista geral incorreta',
);

assert(
  getRoundArchive(
    'DOES-NOT-EXIST',
  ) === null,
  'Rodada inexistente deveria retornar null',
);

console.log(
  'roundArchiveStore integration tests: OK',
);
