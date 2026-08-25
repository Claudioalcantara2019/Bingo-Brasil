import {
  createUiRoom,
  joinUiPlayer,
  startUiRoom,
  processUiBall,
  closeUiRoom,
  type UiRoomState,
  type UiRoomControllerResult,
} from './uiRoomController';

import type {
  RoundPatternCandidates,
} from './roundEngine';

export type UiRoomSession = {
  state: UiRoomState;

  createRoom: (
    maxPlayers?: number,
  ) => UiRoomControllerResult;

  joinPlayer: (
    userId: string,
    cardIds: string[],
  ) => UiRoomControllerResult;

  startRound: (
    roundId: string,
  ) => UiRoomControllerResult;

  processBall: (
    roundId: string,
    triggerNumber: number,
    virtualGoldUsed: number,
    accumulatedBB: number,
    candidates: RoundPatternCandidates,
  ) => UiRoomControllerResult;

  closeRoom: () =>
    UiRoomControllerResult;
};

function updateSessionState(
  session: {
    current: UiRoomState;
  },
  result: UiRoomControllerResult,
): UiRoomControllerResult {
  session.current =
    result.state;

  return result;
}

/**
 * Creates a small session facade for the UI.
 *
 * The screen can keep one session object instead of knowing all
 * domain modules underneath it.
 */
export function createUiRoomSession(
  roomId: string,
  maxPlayers = 100,
): UiRoomSession {
  const initial =
    createUiRoom(
      roomId,
      maxPlayers,
    );

  const session = {
    current:
      initial.state,
  };

  return {
    get state() {
      return session.current;
    },

    createRoom(
      nextMaxPlayers = maxPlayers,
    ) {
      const result =
        createUiRoom(
          roomId,
          nextMaxPlayers,
        );

      return updateSessionState(
        session,
        result,
      );
    },

    joinPlayer(
      userId: string,
      cardIds: string[],
    ) {
      const result =
        joinUiPlayer(
          roomId,
          userId,
          cardIds,
        );

      return updateSessionState(
        session,
        result,
      );
    },

    startRound(
      roundId: string,
    ) {
      const result =
        startUiRoom(
          roomId,
          roundId,
        );

      return updateSessionState(
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
        processUiBall(
          roomId,
          roundId,
          triggerNumber,
          virtualGoldUsed,
          accumulatedBB,
          candidates,
        );

      return updateSessionState(
        session,
        result,
      );
    },

    closeRoom() {
      const result =
        closeUiRoom(
          roomId,
        );

      return updateSessionState(
        session,
        result,
      );
    },
  };
}
