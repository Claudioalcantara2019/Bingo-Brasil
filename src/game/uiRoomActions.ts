import type {
  RoundPatternCandidates,
} from './roundEngine';

import {
  createUiRoomSession,
  type UiRoomSession,
} from './uiRoomSession';

import {
  buildUiRoomPresentation,
  type UiRoomPresentation,
} from './uiRoomPresentation';

export type UiRoomActionResult = {
  ok: boolean;
  state: UiRoomPresentation;
  reason: string;
};

export type UiRoomActions = {
  session: UiRoomSession;

  createRoom: (
    maxPlayers?: number,
  ) => UiRoomActionResult;

  joinPlayer: (
    userId: string,
    cardIds: string[],
  ) => UiRoomActionResult;

  startRound: (
    roundId: string,
  ) => UiRoomActionResult;

  processBall: (
    roundId: string,
    triggerNumber: number,
    virtualGoldUsed: number,
    accumulatedBB: number,
    candidates: RoundPatternCandidates,
  ) => UiRoomActionResult;

  closeRoom: () =>
    UiRoomActionResult;

  read: () =>
    UiRoomPresentation;
};

function toActionResult(
  session: UiRoomSession,
  result: {
    ok: boolean;
    reason: string;
  },
): UiRoomActionResult {
  return {
    ok: result.ok,
    state:
      buildUiRoomPresentation(
        session,
      ),
    reason:
      result.reason,
  };
}

/**
 * Adapter intentionally kept free of React/JSX.
 *
 * Future UI can call this facade without importing domain engines.
 */
export function createUiRoomActions(
  roomId: string,
  maxPlayers = 100,
): UiRoomActions {
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

      return toActionResult(
        session,
        result,
      );
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

      return toActionResult(
        session,
        result,
      );
    },

    startRound(
      roundId: string,
    ) {
      const result =
        session.startRound(
          roundId,
        );

      return toActionResult(
        session,
        result,
      );
    },

    processBall(
      roundId: string,
      triggerNumber: number,
      virtualGoldUsed: number,
      accumulatedBB: number,
      candidates: RoundPatternCandidates,
    ) {
      const result =
        session.processBall(
          roundId,
          triggerNumber,
          virtualGoldUsed,
          accumulatedBB,
          candidates,
        );

      return toActionResult(
        session,
        result,
      );
    },

    closeRoom() {
      const result =
        session.closeRoom();

      return toActionResult(
        session,
        result,
      );
    },

    read() {
      return buildUiRoomPresentation(
        session,
      );
    },
  };
}
