import type {
  RoundPatternCandidates,
} from './roundEngine';

import {
  createUiTicketRoomSession,
  type UiTicketRoomSession,
} from './uiTicketRoomSession';

import type {
  UiRoomPresentation,
} from './uiRoomPresentation';

export type UiTicketActionResult = {
  ok: boolean;
  state: UiRoomPresentation;
  reason: string;

  ticketCount?: number;
  grossGold?: number;
  prizePool?: number;
};

export type UiTicketGameActions = {
  session:
    UiTicketRoomSession;

  createRoom: (
    maxPlayers?: number,
  ) => UiTicketActionResult;

  joinPlayer: (
    userId: string,
    cardIds: string[],
  ) => UiTicketActionResult;

  startRound: (
    roundId: string,
  ) => UiTicketActionResult;

  processBallFromTickets: (
    roundId: string,
    triggerNumber: number,
    ticketValue: number,
    accumulatedBB: number,
    candidates: RoundPatternCandidates,
  ) => UiTicketActionResult;

  closeRoom: () =>
    UiTicketActionResult;

  read: () =>
    UiRoomPresentation;
};

function toActionResult(
  session:
    UiTicketRoomSession,
  result: {
    ok: boolean;
    state: unknown;
    reason: string;
    ticketCount?: number;
    grossGold?: number;
    prizePool?: number;
  },
): UiTicketActionResult {
  return {
    ok:
      result.ok,
    state:
      session.state,
    reason:
      result.reason,
    ticketCount:
      result.ticketCount,
    grossGold:
      result.grossGold,
    prizePool:
      result.prizePool,
  };
}

/**
 * Single UI facade for the ticket-driven round.
 *
 * The future screen should call this facade and should not import
 * room, economy, settlement or round engines directly.
 */
export function createUiTicketGameActions(
  roomId: string,
  maxPlayers = 100,
): UiTicketGameActions {
  const session =
    createUiTicketRoomSession(
      roomId,
      maxPlayers,
    );

  return {
    session,

    createRoom(
      nextMaxPlayers = maxPlayers,
    ) {
      return toActionResult(
        session,
        session.createRoom(
          nextMaxPlayers,
        ),
      );
    },

    joinPlayer(
      userId: string,
      cardIds: string[],
    ) {
      return toActionResult(
        session,
        session.joinPlayer(
          userId,
          cardIds,
        ),
      );
    },

    startRound(
      roundId: string,
    ) {
      return toActionResult(
        session,
        session.startRound(
          roundId,
        ),
      );
    },

    processBallFromTickets(
      roundId: string,
      triggerNumber: number,
      ticketValue: number,
      accumulatedBB: number,
      candidates: RoundPatternCandidates,
    ) {
      return toActionResult(
        session,
        session.processBallFromTickets(
          roundId,
          triggerNumber,
          ticketValue,
          accumulatedBB,
          candidates,
        ),
      );
    },

    closeRoom() {
      return toActionResult(
        session,
        session.closeRoom(),
      );
    },

    read() {
      return session.state;
    },
  };
}
