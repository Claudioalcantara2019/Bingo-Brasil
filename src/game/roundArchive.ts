import type {
  RoundSnapshot,
} from './roundSnapshot';

import type {
  RoundCloseReceipt,
} from './roundCloseReceipt';

import type {
  RoundIntegrityResult,
} from './roundIntegrityCheck';

export type RoundArchive = {
  archiveId: string;
  roomId: string;
  roundId: string;

  snapshot:
    RoundSnapshot;

  receipt:
    RoundCloseReceipt;

  integrity:
    RoundIntegrityResult;

  archivedAt:
    number;
};

/**
 * Creates one immutable-style archive object from
 * the already validated closing data.
 *
 * This function does not mutate the source objects.
 */
export function buildRoundArchive(
  snapshot: RoundSnapshot,
  receipt: RoundCloseReceipt,
  integrity: RoundIntegrityResult,
): RoundArchive {
  return {
    archiveId:
      `ARCHIVE-${snapshot.roundId}-${Date.now()}`,

    roomId:
      snapshot.roomId,

    roundId:
      snapshot.roundId,

    snapshot: {
      ...snapshot,
      audit: [
        ...snapshot.audit,
      ],
    },

    receipt: {
      ...receipt,
    },

    integrity: {
      ...integrity,
      errors: [
        ...integrity.errors,
      ],
      warnings: [
        ...integrity.warnings,
      ],
      auditEntries: [
        ...integrity.auditEntries,
      ],
    },

    archivedAt:
      Date.now(),
  };
}
