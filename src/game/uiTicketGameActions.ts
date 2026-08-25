import type {
  RoundPatternCandidates,
} from './roundEngine';

import {
  processRoomGameEventFromTickets,
} from './roomGameTicketGate';

import {
  createUiRoomSession,
  type UiRoomSession,
} from './uiRoomSession';

import {
  buildUiRoomPresentation,
  type UiRoomPresentation,
} from './uiRoomPresentation';

export type UiTicketGameActionResult = {
  ok: boolean;
  state: UiRoomPresentation;
  reason: string;

  ticketCount: number;
  grossGold: number;
  prizePool: number;
};

export type UiTicketGameActions = {
  session: UiRoomSession;

  createRoom: (
    maxPlayers?: number,
  ) => {
    ok: boolean;
    state: UiRoomPresentation;
    reason: string;
  };

  joinPlayer: (
    userId: string,
    cardIds: string[],
  ) => {
    ok: boolean;
    state: UiRoomPresentation;
    reason: string;
  };

  startRound: (
    roundId: string,
  ) => {
    ok: boolean;
    state: UiRoomPresentation;
    reason: string;
  };

  processBallFromTickets: (
    roundId: string,
    triggerNumber: number,
    ticketValue: number,
    accumulatedBB: number,
    candidates: RoundPatternCandidates,
  ) => UiTicketGameActionResult;

  closeRoom: () => {
    ok: boolean;
    state: UiRoomPresentation;
    reason: string;
  };

  read: () =>
    UiRoomPresentation;
};

function presentation(
  session: UiRoomSession,
) {
  return buildUiRoomPresentation(
    session,
  );
}

/**
 * UI facade for the real ticket-driven economy path.
 *
 * The screen provides the ticket value, while the room itself
 * supplies the number of registered cards.
 */
export function createUiTicketGameActions(
  roomId: string,
  maxPlayers = 100,
): UiTicketGameActions {
  const session =
    createUiRoomSession(
      roomId,
      maxPlayers,
    );

  return {
    session,

    createRoom(
      nextMaxPlayers = maxPlayers,
    ) {
      const result =
        session.createRoom(
          nextMaxPlayers,
        );

      return {
        ok:
          result.ok,
        state:
          presentation(session),
        reason:
          result.reason,
      };
    },

    joinPlayer(
      userId: string,
      cardIds: string[],
    ) {
      const result =
        session.joinPlayer(
          userId,
          cardIds,
        );

      return {
        ok:
          result.ok,
        state:
          presentation(session),
        reason:
          result.reason,
      };
    },

    startRound(
      roundId: string,
    ) {
      const result =
        session.startRound(
          roundId,
        );

      return {
        ok:
          result.ok,
        state:
          presentation(session),
        reason:
          result.reason,
      };
    },

    processBallFromTickets(
      roundId: string,
      triggerNumber: number,
      ticketValue: number,
      accumulatedBB: number,
      candidates: RoundPatternCandidates,
    ) {
      const result =
        processRoomGameEventFromTickets({
          roomId:
            roomId,
          roundId:
            roundId,
          triggerNumber:
            triggerNumber,
          ticketValue:
            ticketValue,
          accumulatedBB:
            accumulatedBB,
          candidates:
            candidates,
        });

      return {
        ok:
          result.roomResult.ok,

        state:
          presentation(session),

        reason:
          result.roomResult.reason,

        ticketCount:
          result.ticketCount,

        grossGold:
          result.grossGold,

        prizePool:
          result.prizePool,
      };
    },

    closeRoom() {
      const result =
        session.closeRoom();

      return {
        ok:
          result.ok,
        state:
          presentation(session),
        reason:
          result.reason,
      };
    },

    read() {
      return presentation(
        session,
      );
    },
  };
}
