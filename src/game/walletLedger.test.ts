import {
  clearWalletLedgerTestStore,
  creditWallet,
  getWalletBalance,
  getWalletLedgerEntries,
} from './walletLedger';

function assert(
  condition: boolean,
  message: string,
) {
  if (!condition) {
    throw new Error(message);
  }
}

clearWalletLedgerTestStore();

const first =
  creditWallet({
    userId: 'PLAYER-1',
    settlementKey:
      'ROUND-1-BINGO-57',
    gold: 500,
    bb: 4,
  });

assert(
  first.status === 'credited',
  'Primeiro crédito deveria ser realizado',
);

assert(
  first.balance.gold === 500 &&
    first.balance.bb === 4,
  'Saldo inicial incorreto',
);

const second =
  creditWallet({
    userId: 'PLAYER-1',
    settlementKey:
      'ROUND-1-BINGO-57',
    gold: 500,
    bb: 4,
  });

assert(
  second.status ===
    'already-credited',
  'Crédito duplicado não foi bloqueado',
);

const balanceAfterDuplicate =
  getWalletBalance(
    'PLAYER-1',
  );

assert(
  balanceAfterDuplicate.gold ===
      500 &&
    balanceAfterDuplicate.bb === 4,
  'Crédito duplicado alterou o saldo',
);

const anotherPlayer =
  creditWallet({
    userId: 'PLAYER-2',
    settlementKey:
      'ROUND-1-BINGO-57',
    gold: 500,
    bb: 4,
  });

assert(
  anotherPlayer.status ===
    'credited',
  'Segundo jogador não foi creditado',
);

assert(
  getWalletBalance(
    'PLAYER-2',
  ).gold === 500,
  'Saldo do segundo jogador incorreto',
);

const invalid =
  creditWallet({
    userId: 'PLAYER-3',
    settlementKey:
      'ROUND-INVALID',
    gold: -1,
    bb: 2,
  });

assert(
  invalid.status ===
    'rejected',
  'Crédito negativo deveria ser rejeitado',
);

assert(
  getWalletLedgerEntries(
    'PLAYER-1',
  ).length === 1,
  'Ledger do jogador 1 deveria ter 1 entrada',
);

assert(
  getWalletLedgerEntries().length === 2,
  'Ledger total deveria ter 2 entradas',
);

console.log(
  'walletLedger tests: OK',
);
