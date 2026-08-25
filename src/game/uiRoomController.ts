import {
  createRoomRound,
  joinRoomPlayer,
  startRoomRound,
  closeRoomRound,
  getRoomRoundState,
} from './roomRoundCoordinator';

import {
  processRoomGameEvent,
} from './roomGameEngine';

import type {
  RoundPatternCandidates,
} from './roundEngine';

import {
  buildUiRoundSummary,
  type UiRoundSummary,
} from './uiGameBridge';

export type UiRoomState = {
  roomId: string;
  roundId: string | null;

  view:
    UiRoundSummary;

  playerCount: number;

  cardsByPlayer:
    Record<string, string[]>;

  ready: boolean;
};

export type UiRoomControllerResult = {
  ok: boolean;
  state: UiRoomState;
  reason: string;
};

function buildState(
  roomId: string,
  summary?: UiRoundSummary,
): UiRoomState {
  const roomState =
    getRoomRoundState(
      roomId,
    );

  const players =
    roomState.room?.players ??
    [];

  const defaultView =
    buildUiRoundSummary({
      ok: true,
      reason:
        'processed',
      roomStatus:
        roomState.room?.status ??
        'missing',
      roundStatus:
        roomState.roundStatus,
      flow: null,
    });

  return {
    roomId,
    roundId:
      roomState.room?.roundId ??
      null,

    view:
      summary ??
      defaultView,

    playerCount:
      players.length,

    cardsByPlayer:
      Object.fromEntries(
        players.map(
          (player) => [
            player.userId,
            [
              ...player.cardIds,
            ],
          ],
        ),
      ),

    ready:
      roomState.room?.status ===
        'running' &&
      roomState.roundStatus ===
        'running',
  };
}

export function createUiRoom(
  roomId: string,
  maxPlayers = 100,
): UiRoomControllerResult {
  const result =
    createRoomRound(
      roomId,
      maxPlayers,
    );

  return {
    ok: result.ok,
    state:
      buildState(
        roomId,
      ),
    reason:
      result.reason,
  };
}

export function joinUiPlayer(
  roomId: string,
  userId: string,
  cardIds: string[],
): UiRoomControllerResult {
  const result =
    joinRoomPlayer(
      roomId,
      userId,
      cardIds,
    );

  return {
    ok: result.ok,
    state:
      buildState(
        roomId,
      ),
    reason:
      result.reason,
  };
}

export function startUiRoom(
  roomId: string,
  roundId: string,
): UiRoomControllerResult {
  const result =
    startRoomRound(
      roomId,
      roundId,
    );

  return {
    ok: result.ok,
    state:
      buildState(
        roomId,
      ),
    reason:
      result.reason,
  };
}

export function processUiBall(
  roomId: string,
  roundId: string,
  triggerNumber: number,
  virtualGoldUsed: number,
  accumulatedBB: number,
  candidates: RoundPatternCandidates,
): UiRoomControllerResult {
  const result =
    processRoomGameEvent({
      roomId,
      roundId,
      triggerNumber,
      virtualGoldUsed,
      accumulatedBB,
      candidates,
    });

  return {
    ok: result.ok,
    state:
      buildState(
        roomId,
        buildUiRoundSummary(
          result,
        ),
      ),
    reason:
      result.reason,
  };
}

export function closeUiRoom(
  roomId: string,
): UiRoomControllerResult {
  const result =
    closeRoomRound(
      roomId,
    );

  return {
    ok: result.ok,
    state:
      buildState(
        roomId,
      ),
    reason:
      result.reason,
  };
}
