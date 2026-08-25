export type AuditEventType =
  | 'round-created'
  | 'round-started'
  | 'ball-drawn'
  | 'pattern-detected'
  | 'settlement-paid'
  | 'wallet-credited'
  | 'round-closed';

export type AuditEntry = {
  id: string;
  roundId: string;
  type: AuditEventType;
  triggerNumber: number | null;
  userId: string | null;
  category:
    | 'terno'
    | 'quadra'
    | 'diagonal'
    | 'linha'
    | 'dupla'
    | 'bingo'
    | null;
  gold: number;
  bb: number;
  message: string;
  createdAt: number;
};

const entries: AuditEntry[] = [];

export function clearRoundAuditTestStore() {
  entries.length = 0;
}

function addAuditEntry(
  input: Omit<
    AuditEntry,
    'id' | 'createdAt'
  >,
): AuditEntry {
  const entry: AuditEntry = {
    ...input,
    id:
      `AUDIT-${Date.now()}-${entries.length + 1}`,
    createdAt:
      Date.now(),
  };

  entries.push(entry);
  return { ...entry };
}

export function recordRoundCreated(
  roundId: string,
): AuditEntry {
  return addAuditEntry({
    roundId,
    type: 'round-created',
    triggerNumber: null,
    userId: null,
    category: null,
    gold: 0,
    bb: 0,
    message:
      'Rodada criada',
  });
}

export function recordRoundStarted(
  roundId: string,
): AuditEntry {
  return addAuditEntry({
    roundId,
    type: 'round-started',
    triggerNumber: null,
    userId: null,
    category: null,
    gold: 0,
    bb: 0,
    message:
      'Rodada iniciada',
  });
}

export function recordBallDrawn(
  roundId: string,
  triggerNumber: number,
): AuditEntry {
  return addAuditEntry({
    roundId,
    type: 'ball-drawn',
    triggerNumber,
    userId: null,
    category: null,
    gold: 0,
    bb: 0,
    message:
      `Bola ${triggerNumber} sorteada`,
  });
}

export function recordPatternDetected(
  roundId: string,
  triggerNumber: number,
  userId: string,
  category:
    | 'terno'
    | 'quadra'
    | 'diagonal'
    | 'linha'
    | 'dupla'
    | 'bingo',
): AuditEntry {
  return addAuditEntry({
    roundId,
    type: 'pattern-detected',
    triggerNumber,
    userId,
    category,
    gold: 0,
    bb: 0,
    message:
      `${category} detectado`,
  });
}

export function recordSettlementPaid(
  roundId: string,
  triggerNumber: number,
  category:
    | 'terno'
    | 'quadra'
    | 'diagonal'
    | 'linha'
    | 'dupla'
    | 'bingo',
  gold: number,
  bb: number,
): AuditEntry {
  return addAuditEntry({
    roundId,
    type: 'settlement-paid',
    triggerNumber,
    userId: null,
    category,
    gold:
      Math.max(
        0,
        Math.floor(gold),
      ),
    bb:
      Math.max(
        0,
        Math.floor(bb),
      ),
    message:
      `${category} liquidado`,
  });
}

export function recordWalletCredited(
  roundId: string,
  triggerNumber: number,
  userId: string,
  category:
    | 'terno'
    | 'quadra'
    | 'diagonal'
    | 'linha'
    | 'dupla'
    | 'bingo',
  gold: number,
  bb: number,
): AuditEntry {
  return addAuditEntry({
    roundId,
    type: 'wallet-credited',
    triggerNumber,
    userId,
    category,
    gold:
      Math.max(
        0,
        Math.floor(gold),
      ),
    bb:
      Math.max(
        0,
        Math.floor(bb),
      ),
    message:
      `Carteira de ${userId} creditada`,
  });
}

export function recordRoundClosed(
  roundId: string,
  triggerNumber: number,
): AuditEntry {
  return addAuditEntry({
    roundId,
    type: 'round-closed',
    triggerNumber,
    userId: null,
    category: null,
    gold: 0,
    bb: 0,
    message:
      'Rodada encerrada',
  });
}

export function getRoundAudit(
  roundId: string,
): AuditEntry[] {
  return entries
    .filter(
      (entry) =>
        entry.roundId ===
        roundId,
    )
    .map(
      (entry) => ({
        ...entry,
      }),
    );
}

export function getAllAuditEntries():
  AuditEntry[] {
  return entries.map(
    (entry) => ({
      ...entry,
    }),
  );
}

export function getRoundAuditTotals(
  roundId: string,
) {
  const roundEntries =
    getRoundAudit(
      roundId,
    );

  return {
    entries:
      roundEntries.length,
    gold:
      roundEntries.reduce(
        (sum, entry) =>
          sum + entry.gold,
        0,
      ),
    bb:
      roundEntries.reduce(
        (sum, entry) =>
          sum + entry.bb,
        0,
      ),
    balls:
      roundEntries.filter(
        (entry) =>
          entry.type ===
          'ball-drawn',
      ).length,
    patterns:
      roundEntries.filter(
        (entry) =>
          entry.type ===
          'pattern-detected',
      ).length,
    settlements:
      roundEntries.filter(
        (entry) =>
          entry.type ===
          'settlement-paid',
      ).length,
    walletCredits:
      roundEntries.filter(
        (entry) =>
          entry.type ===
          'wallet-credited',
      ).length,
    closed:
      roundEntries.some(
        (entry) =>
          entry.type ===
          'round-closed',
      ),
  };
}
