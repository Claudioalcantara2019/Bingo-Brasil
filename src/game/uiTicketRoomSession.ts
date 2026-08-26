import type {
  RoundPatternCandidates,
} from './roundEngine';

import type {
  UiRoomPresentation,
} from './uiRoomPresentation';

import {
  buildUiPrizeSlotState,
} from './uiPrizeSlots';

import {
  buildUiRoundSummary,
} from './uiGameBridge';

import {
  closeUiTicketRoom,
  createUiTicketRoom,
  joinUiTicketPlayer,
  processUiTicketBall,
  startUiTicketRoom,
  type UiTicketRoomControllerResult,
} from './uiTicketRoomController';

export type UiTicketRoomSession = {
  readonly state:
    UiRoomPresentation;

  createRoom: (
    maxPlayers?: number,
  ) => UiTicketRoomControllerResult;

  joinPlayer: (
    userId: string,
    cardIds: string[],
  ) => UiTicketRoomControllerResult;

  startRound: (
    roundId: string,
  ) => UiTicketRoomControllerResult;

  processBallFromTickets: (
    roundId: string,
    triggerNumber: number,
    ticketValue: number,
    accumulatedBB: number,
    candidates: RoundPatternCandidates,
  ) => UiTicketRoomControllerResult;

  closeRoom: () =>
    UiTicketRoomControllerResult;
};

function buildUiRoomPresentationFromResult(
  result: UiTicketRoomControllerResult,
): UiRoomPresentation {
  return buildUiRoomPresentationFromState(
    result.state,
  );
}

function buildUiRoomPresentationFromState(
  state: UiTicketRoomControllerResult['state'],
): UiRoomPresentation {
  const view =
    state.view;

  return {
    roomId:
      state.roomId,
    roundId:
      state.roundId,
    header: {
      roomStatus:
        view.roomStatus ===
        'running'
          ? 'Sala em andamento'
          : view.roomStatus ===
            'closed'
            ? 'Sala encerrada'
            : view.roomStatus ===
              'waiting'
              ? 'Aguardando jogadores'
              : 'Sala indisponível',
      roundStatus:
        view.roundStatus ===
        'running'
          ? 'Rodada em andamento'
          : view.roundStatus ===
            'closed'
            ? 'Rodada encerrada'
            : view.roundStatus ===
              'open'
              ? 'Rodada aberta'
              : 'Sem rodada',
      connection:
        view.blocked
          ? 'Bloqueado'
          : 'Conectado',
      players:
        `${state.playerCount} jogador${
          state.playerCount ===
          1
            ? ''
            : 'es'
        }`,
    },
    round: {
      id:
        state.roundId ??
        'Sem rodada',
      lastNumber:
        view.finished
          ? 'Rodada encerrada'
          : 'Aguardando bola',
      banner:
        view.finished
          ? '🎱 BINGO — rodada encerrada'
          : view.blocked
            ? '🔒 Ação bloqueada'
            : state.ready
              ? '🎱 Rodada em andamento'
              : 'Aguardando início da rodada',
      blocked:
        view.blocked,
    },
    economy: {
      goldPaid:
        String(
          view.totalGoldPaid,
        ),
      bbPaid:
        String(
          view.totalBBPaid,
        ),
    },
    prizes:
      view.prizes.map(
        (prize) => ({
          ...prize,
          statusText:
            prize.status,
          winnersText:
            prize.winners === 1
              ? '1 vencedor'
              : prize.winners === 0
                ? 'Nenhum vencedor'
                : `${prize.winners} vencedores`,
          slotsText:
            buildUiPrizeSlotState(
              prize.key,
              prize.winners,
            ).text,
          paidText:
            String(prize.paid),
          remainingText:
            String(prize.remaining),
          highlighted:
            prize.status ===
            'paid',
        }),
      ),
  };
}

export function createUiTicketRoomSession(
  roomId: string,
  maxPlayers = 100,
): UiTicketRoomSession {
  const initialState = {
    roomId,
    roundId: null,
    view: buildUiRoundSummary({
      ok: false,
      reason: 'room-not-running',
      roomStatus: 'missing',
      roundStatus: 'none',
      flow: null,
    }),
    playerCount: 0,
    cardsByPlayer: {},
    ready: false,
  };

  let current: UiTicketRoomControllerResult['state'] = initialState;

  const sync =
    (
      result:
        UiTicketRoomControllerResult,
    ) => {
      current =
        result.state;
      return result;
    };

  return {
    get state() {
      return buildUiRoomPresentationFromState(
        current,
      );
    },

    createRoom(
      nextMaxPlayers = maxPlayers,
    ) {
      return sync(
        createUiTicketRoom(
          roomId,
          nextMaxPlayers,
        ),
      );
    },

    joinPlayer(
      userId,
      cardIds,
    ) {
      return sync(
        joinUiTicketPlayer(
          roomId,
          userId,
          cardIds,
        ),
      );
    },

    startRound(
      roundId,
    ) {
      return sync(
        startUiTicketRoom(
          roomId,
          roundId,
        ),
      );
    },

    processBallFromTickets(
      roundId,
      triggerNumber,
      ticketValue,
      accumulatedBB,
      candidates,
    ) {
      return sync(
        processUiTicketBall(
          roomId,
          roundId,
          triggerNumber,
          ticketValue,
          accumulatedBB,
          candidates,
        ),
      );
    },

    closeRoom() {
      return sync(
        closeUiTicketRoom(
          roomId,
        ),
      );
    },
  };
}
