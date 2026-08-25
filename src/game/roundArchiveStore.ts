import type {
  RoundArchive,
} from './roundArchive';

const archives =
  new Map<string, RoundArchive>();

function cloneArchive(
  archive: RoundArchive,
): RoundArchive {
  return {
    ...archive,
    snapshot: {
      ...archive.snapshot,
      audit: [
        ...archive.snapshot.audit,
      ],
    },
    receipt: {
      ...archive.receipt,
    },
    integrity: {
      ...archive.integrity,
      errors: [
        ...archive.integrity.errors,
      ],
      warnings: [
        ...archive.integrity.warnings,
      ],
      auditEntries: [
        ...archive.integrity.auditEntries,
      ],
    },
  };
}

export function clearRoomArchiveStoreTestStore() {
  archives.clear();
}

export function saveRoundArchive(
  archive: RoundArchive,
): {
  ok: boolean;
  reason:
    | 'saved'
    | 'already-exists';
  archive: RoundArchive;
} {
  const existing =
    archives.get(
      archive.roundId,
    );

  if (existing) {
    return {
      ok: true,
      reason:
        'already-exists',
      archive:
        cloneArchive(
          existing,
        ),
    };
  }

  archives.set(
    archive.roundId,
    cloneArchive(
      archive,
    ),
  );

  return {
    ok: true,
    reason: 'saved',
    archive:
      cloneArchive(
        archive,
      ),
  };
}

export function getRoundArchive(
  roundId: string,
): RoundArchive | null {
  const archive =
    archives.get(
      roundId,
    );

  return archive
    ? cloneArchive(
        archive,
      )
    : null;
}

export function listRoundArchives():
  RoundArchive[] {
  return Array.from(
    archives.values(),
  )
    .sort(
      (a, b) =>
        b.archivedAt -
        a.archivedAt,
    )
    .map(
      (archive) =>
        cloneArchive(
          archive,
        ),
    );
}

export function listRoomArchives(
  roomId: string,
): RoundArchive[] {
  return listRoundArchives().filter(
    (archive) =>
      archive.roomId ===
      roomId,
  );
}

export function getArchivedRoundCount(): number {
  return archives.size;
}
