import {
  buildUiPrizeSlotState,
  buildUiPrizeSlotStates,
} from './uiPrizeSlots';

function assert(
  condition: boolean,
  message: string,
) {
  if (!condition) {
    throw new Error(message);
  }
}

const terno =
  buildUiPrizeSlotState(
    'terno',
    3,
  );

assert(
  terno.text === '3/5' &&
    terno.filled === 3 &&
    terno.limit === 5 &&
    terno.remainingSlots === 2,
  'Terno deveria mostrar 3/5',
);

const quadra =
  buildUiPrizeSlotState(
    'quadra',
    4,
  );

assert(
  quadra.text === '3/3' &&
    quadra.filled === 3 &&
    quadra.remainingSlots === 0,
  'Quadra deveria limitar a 3/3',
);

const linha =
  buildUiPrizeSlotState(
    'linha',
    1,
  );

assert(
  linha.text === '1/3' &&
    linha.remainingSlots === 2,
  'Linha deveria mostrar 1/3',
);

const dupla =
  buildUiPrizeSlotState(
    'dupla',
    2,
  );

assert(
  dupla.text === '2/3' &&
    dupla.remainingSlots === 1,
  'Linha Dupla deveria mostrar 2/3',
);

const bingo =
  buildUiPrizeSlotState(
    'bingo',
    7,
  );

assert(
  bingo.text === '7' &&
    bingo.limit === null &&
    bingo.remainingSlots === null,
  'Bingo não deveria ter limite fixo',
);

const all =
  buildUiPrizeSlotStates({
    terno: 1,
    quadra: 2,
    linha: 3,
    dupla: 1,
  });

assert(
  all.length === 6 &&
    all.find(
      (item) =>
        item.key ===
          'terno' &&
        item.text ===
          '1/5',
    ) !== undefined &&
    all.find(
      (item) =>
        item.key ===
          'bingo' &&
        item.text ===
          '0',
    ) !== undefined,
  'Tabela de vagas UI não foi montada corretamente',
);

console.log(
  'uiPrizeSlots tests: OK',
);
