import {
  calculateGrossGoldFromCards,
  calculateRoundTicketEconomy,
} from './roundTicketEconomy';

function assert(
  condition: boolean,
  message: string,
) {
  if (!condition) {
    throw new Error(message);
  }
}

const one =
  calculateRoundTicketEconomy(
    1,
    25,
  );

assert(
  one.ticketCount === 1 &&
    one.ticketValue === 25 &&
    one.grossGold === 25,
  'Uma cartela deveria gerar 25 fichas brutas',
);

assert(
  one.prizePool === 16 &&
    one.retainedGold === 9,
  'Retorno de 65% da rodada incorreto',
);

assert(
  Object.values(
    one.categoryPools,
  ).reduce(
    (sum, value) =>
      sum + value,
    0,
  ) === one.prizePool,
  'Pools das categorias não fecham com o pool',
);

const ten =
  calculateRoundTicketEconomy(
    10,
    25,
  );

assert(
  ten.grossGold === 250 &&
    ten.prizePool === 162 &&
    ten.retainedGold === 88,
  'Economia de 10 cartelas incorreta',
);

const hundred =
  calculateRoundTicketEconomy(
    100,
    25,
  );

assert(
  hundred.grossGold ===
      2500 &&
    hundred.prizePool ===
      1625 &&
    hundred.retainedGold ===
      875,
  'Economia de 100 cartelas incorreta',
);

assert(
  calculateGrossGoldFromCards(
    7,
    25,
  ) === 175,
  'Cálculo bruto por cartelas incorreto',
);

const invalid =
  calculateRoundTicketEconomy(
    -4,
    -100,
  );

assert(
  invalid.ticketCount === 0 &&
    invalid.ticketValue === 0 &&
    invalid.grossGold === 0 &&
    invalid.prizePool === 0,
  'Valores inválidos deveriam ser normalizados para zero',
);

const customRate =
  calculateRoundTicketEconomy(
    100,
    25,
    0.50,
  );

assert(
  customRate.prizePool ===
      1250 &&
    customRate.retainedGold ===
      1250,
  'Taxa configurável não funcionou',
);

console.log(
  'roundTicketEconomy tests: OK',
);
