import {
  clearRoundWinnerRegistryTestStore,
  registerRoundWinners,
} from './roundWinnerRegistry';

import {
  getRoundCategoryWinnerCount,
} from './roundWinnerRegistry';

function assert(
  condition: boolean,
  message: string,
) {
  if (!condition) {
    throw new Error(message);
  }
}

clearRoundWinnerRegistryTestStore();

registerRoundWinners(
  'UI-CUMULATIVE-ROUND',
  'terno',
  [
    {
      userId: 'A',
      cardId: 'A1',
    },
  ],
  47,
);

registerRoundWinners(
  'UI-CUMULATIVE-ROUND',
  'diagonal',
  [
    {
      userId: 'B',
      cardId: 'B1',
    },
  ],
  48,
);

assert(
  getRoundCategoryWinnerCount(
    'UI-CUMULATIVE-ROUND',
    'terno',
  ) === 1,
  'Terno deveria permanecer registrado na rodada',
);

assert(
  getRoundCategoryWinnerCount(
    'UI-CUMULATIVE-ROUND',
    'diagonal',
  ) === 1,
  'Diagonal deveria ser registrada na mesma rodada',
);

assert(
  getRoundCategoryWinnerCount(
    'UI-CUMULATIVE-ROUND',
    'quadra',
  ) === 0,
  'Quadra não deveria aparecer sem conquista',
);

console.log(
  'uiGameBridge cumulative winner registry regression: OK',
);
