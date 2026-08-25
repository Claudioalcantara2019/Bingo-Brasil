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
} from './roundAuditLedger';

import {
  createRoomRound,
  startRoomRound,
  closeRoomRound,
} from './roomRoundCoordinator';

import {
  buildRoundSnapshot,
} from './roundSnapshot';

import {
  buildRoundCloseReceipt,
} from './roundCloseReceipt';

import {
  checkRoundIntegrity,
} from './roundIntegrityCheck';

import {
  buildRoundArchive,
} from './roundArchive';

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
  'ARCHIVE-ROOM',
  2,
);

createRoomRound(
  'ARCHIVE-ROOM',
  2,
);

joinRoom(
  'ARCHIVE-ROOM',
  'A',
  ['A1'],
);

startRoomRound(
  'ARCHIVE-ROOM',
  'ARCHIVE-ROUND',
);

closeRoomRound(
  'ARCHIVE-ROOM',
);

const snapshot =
  buildRoundSnapshot(
    'ARCHIVE-ROOM',
    'ARCHIVE-ROUND',
    {
      roundId:
        'ARCHIVE-ROUND',
      triggerNumber:
        75,
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
        650,
      residualBB:
        0,
      roundClosed:
        true,
    },
    0,
    0,
  );

const settlement = {
  roundId:
    'ARCHIVE-ROUND',
  triggerNumber:
    75,
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
    650,
  residualBB:
    0,
  roundClosed:
    true,
};

const integrity =
  checkRoundIntegrity(
    'ARCHIVE-ROOM',
    'ARCHIVE-ROUND',
    settlement,
  );

assert(
  integrity.ok,
  'Integridade deveria estar aprovada',
);

const receipt =
  buildRoundCloseReceipt(
    snapshot,
    integrity,
    'bingo',
  );

const archive =
  buildRoundArchive(
    snapshot,
    receipt,
    integrity,
  );

assert(
  archive.roomId ===
      'ARCHIVE-ROOM' &&
    archive.roundId ===
      'ARCHIVE-ROUND',
  'Identificação do arquivo incorreta',
);

assert(
  archive.snapshot.roundId ===
      archive.receipt.roundId &&
    archive.receipt.roomId ===
      archive.snapshot.roomId,
  'Snapshot e recibo não estão sincronizados',
);

assert(
  archive.integrity.ok,
  'Arquivo deveria conter integridade aprovada',
);

assert(
  archive.receipt.integrityOk,
  'Recibo do arquivo deveria estar íntegro',
);

assert(
  archive.archivedAt > 0 &&
    archive.archiveId.includes(
      'ARCHIVE-ROUND',
    ),
  'Metadados do arquivo incorretos',
);

assert(
  archive.snapshot !==
      snapshot &&
    archive.receipt !==
      receipt &&
    archive.integrity !==
      integrity,
  'Arquivo deveria criar objetos independentes',
);

console.log(
  'roundArchive integration tests: OK',
);
