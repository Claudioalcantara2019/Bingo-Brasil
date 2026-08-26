import type {
  UiRoomState,
} from './uiRoomController';

import {
  buildUiPrizeSlotState,
} from './uiPrizeSlots';

export type UiPrizeViewRow = {
  key:
    | 'terno'
    | 'quadra'
    | 'diagonal'
    | 'linha'
    | 'dupla'
    | 'bingo';

  label: string;
  statusText: string;
  winnersText: string;
  slotsText: string;
  paidText: string;
  remainingText: string;
  highlighted: boolean;
};

export type UiRoomViewModel = {
  roomStatusText: string;
  roundStatusText: string;
  connectionText: string;

  playerCountText: string;
  roundIdText: string;
  lastNumberText: string;

  totalGoldPaidText: string;
  totalBBPaidText: string;

  bannerText: string;
  blocked: boolean;

  prizes: UiPrizeViewRow[];
};

function formatInteger(
  value: number,
): string {
  return new Intl.NumberFormat(
    'pt-BR',
  ).format(
    Math.max(
      0,
      Math.floor(value),
    ),
  );
}

function roomStatusText(
  status: UiRoomState['view']['roomStatus'],
): string {
  if (status === 'waiting') {
    return 'Aguardando jogadores';
  }

  if (status === 'running') {
    return 'Sala em andamento';
  }

  if (status === 'closed') {
    return 'Sala encerrada';
  }

  return 'Sala indisponível';
}

function roundStatusText(
  status: UiRoomState['view']['roundStatus'],
): string {
  if (status === 'none') {
    return 'Sem rodada';
  }

  if (status === 'open') {
    return 'Rodada aberta';
  }

  if (status === 'running') {
    return 'Rodada em andamento';
  }

  return 'Rodada encerrada';
}

function prizeStatusText(
  status:
    | 'waiting'
    | 'detected'
    | 'paid',
): string {
  if (status === 'paid') {
    return 'Pago';
  }

  if (status === 'detected') {
    return 'Detectado';
  }

  return 'Aguardando';
}

function winnerText(
  winners: number,
): string {
  if (winners === 0) {
    return 'Nenhum vencedor';
  }

  if (winners === 1) {
    return '1 vencedor';
  }

  return `${winners} vencedores`;
}

function buildBanner(
  state: UiRoomState,
): string {
  if (state.view.finished) {
    return '🎱 BINGO — rodada encerrada';
  }

  if (state.view.blocked) {
    return '🔒 Ação bloqueada';
  }

  if (!state.ready) {
    return 'Aguardando início da rodada';
  }

  return '🎱 Rodada em andamento';
}

/**
 * Converts the internal UI state into simple presentation data.
 *
 * No React, no JSX, no side effects.
 */
export function buildUiRoomViewModel(
  state: UiRoomState,
): UiRoomViewModel {
  return {
    roomStatusText:
      roomStatusText(
        state.view.roomStatus,
      ),

    roundStatusText:
      roundStatusText(
        state.view.roundStatus,
      ),

    connectionText:
      state.view.blocked
        ? 'Bloqueado'
        : 'Conectado',

    playerCountText:
      `${state.playerCount} jogador${
        state.playerCount === 1
          ? ''
          : 'es'
      }`,

    roundIdText:
      state.roundId ??
      'Sem rodada',

    lastNumberText:
      state.view.finished &&
      state.view.prizes.length > 0
        ? 'Rodada encerrada'
        : 'Aguardando bola',

    totalGoldPaidText:
      formatInteger(
        state.view.totalGoldPaid,
      ),

    totalBBPaidText:
      formatInteger(
        state.view.totalBBPaid,
      ),

    bannerText:
      buildBanner(state),

    blocked:
      state.view.blocked,

    prizes:
      state.view.prizes.map(
        (prize) => {
          const slots =
            buildUiPrizeSlotState(
              prize.key,
              prize.winners,
            );

          return {
            key:
              prize.key,

            label:
              prize.label,

            statusText:
              prizeStatusText(
                prize.status,
              ),

            winnersText:
              winnerText(
                prize.winners,
              ),

            slotsText:
              slots.text,

            paidText:
              formatInteger(
                prize.paid,
              ),

            remainingText:
              formatInteger(
                prize.remaining,
              ),

            highlighted:
              prize.status ===
              'paid',
          };
        },
      ),
  };
}
