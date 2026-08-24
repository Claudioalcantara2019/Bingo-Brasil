export type WalletBalance = {
  gold: number;
  bb: number;
};

export type WalletCredit = {
  userId: string;
  settlementKey: string;
  gold: number;
  bb: number;
};

export type WalletLedgerEntry = WalletCredit & {
  ledgerId: string;
  createdAt: number;
};

export type WalletLedgerResult = {
  status: 'credited' | 'already-credited' | 'rejected';
  entry: WalletLedgerEntry | null;
  balance: WalletBalance;
};

/**
 * Local in-memory wallet store for testing.
 *
 * In production this becomes a database transaction:
 * - verify settlement exists and is paid;
 * - lock player wallet;
 * - apply both currencies atomically;
 * - record ledgerId / settlementKey;
 * - commit.
 */
const balances = new Map<
  string,
  WalletBalance
>();

const creditedSettlementKeys =
  new Set<string>();

const ledgerEntries: WalletLedgerEntry[] =
  [];

export function clearWalletLedgerTestStore() {
  balances.clear();
  creditedSettlementKeys.clear();
  ledgerEntries.length = 0;
}

export function getWalletBalance(
  userId: string,
): WalletBalance {
  const current =
    balances.get(userId);

  if (!current) {
    return {
      gold: 0,
      bb: 0,
    };
  }

  return {
    gold: current.gold,
    bb: current.bb,
  };
}

export function getWalletLedgerEntries(
  userId?: string,
): WalletLedgerEntry[] {
  if (!userId) {
    return [...ledgerEntries];
  }

  return ledgerEntries.filter(
    (entry) =>
      entry.userId === userId,
  );
}

/**
 * Credits both currencies as one logical operation.
 *
 * A settlementKey can only credit a player once.
 * Negative values are rejected.
 */
export function creditWallet(
  input: WalletCredit,
): WalletLedgerResult {
  if (
    !input.userId ||
    !input.settlementKey ||
    input.gold < 0 ||
    input.bb < 0
  ) {
    return {
      status: 'rejected',
      entry: null,
      balance:
        getWalletBalance(
          input.userId,
        ),
    };
  }

  const uniqueKey =
    `${input.userId}:${input.settlementKey}`;

  if (
    creditedSettlementKeys.has(
      uniqueKey,
    )
  ) {
    return {
      status: 'already-credited',
      entry: null,
      balance:
        getWalletBalance(
          input.userId,
        ),
    };
  }

  const current =
    getWalletBalance(
      input.userId,
    );

  const next: WalletBalance = {
    gold:
      current.gold +
      Math.floor(input.gold),
    bb:
      current.bb +
      Math.floor(input.bb),
  };

  const entry: WalletLedgerEntry = {
    ledgerId:
      `LEDGER-${Date.now()}-${ledgerEntries.length + 1}`,
    createdAt:
      Date.now(),
    userId:
      input.userId,
    settlementKey:
      input.settlementKey,
    gold:
      Math.floor(input.gold),
    bb:
      Math.floor(input.bb),
  };

  balances.set(
    input.userId,
    next,
  );

  ledgerEntries.push(entry);
  creditedSettlementKeys.add(
    uniqueKey,
  );

  return {
    status: 'credited',
    entry,
    balance: {
      ...next,
    },
  };
}
