import {
  createUiRoom,
  joinUiPlayer,
  startUiRoom,
  closeUiRoom,
  type UiRoomState,
  type UiRoomControllerResult,
} from './uiRoomController';

import {
  processRoomGameEventFromTickets,
} from './roomGameTicketGate';

import {
  buildUiRoundSummary,
} from './uiGameBridge';

import {
  getRoomRoundState,
} from './roomRoundCoordinator';

import type {
  RoundPatternCandidates,
} from './roundEngine';

export type UiTicketRoomControllerResult =
  UiRoomControllerResult & {
    ticketCount?: number;
    grossGold?: number;
    prizePool?: number;
  };

function snapshotState(
  roomId: string,
  summary: ReturnType<
    typeof buildUiRoundSummary
  >,
): UiRoomState {
  const roomState =
    getRoomRoundState(
      roomId,
    );

  const players =
    roomState.room?.players ??
    [];

  return {
    roomId,
    roundId:
      roomState.room?.roundId ??
      null,
    view:
      summary,
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

export function createUiTicketRoom(
  roomId: string,
  maxPlayers = 100,
): UiTicketRoomControllerResult {
  return createUiRoom(
    roomId,
    maxPlayers,
  );
}

export function joinUiTicketPlayer(
  roomId: string,
  userId: string,
  cardIds: string[],
): UiTicketRoomControllerResult {
  return joinUiPlayer(
    roomId,
    userId,
    cardIds,
  );
}

export function startUiTicketRoom(
  roomId: string,
  roundId: string,
): UiTicketRoomControllerResult {
  return startUiRoom(
    roomId,
    roundId,
  );
}

export function processUiTicketBall(
  roomId: string,
  roundId: string,
  triggerNumber: number,
  ticketValue: number,
  accumulatedBB: number,
  candidates: RoundPatternCandidates,
): UiTicketRoomControllerResult {
  const result =
    processRoomGameEventFromTickets({
      roomId,
      roundId,
      triggerNumber,
      ticketValue,
      accumulatedBB,
      candidates,
    });

  return {
    ok:
      result.roomResult.ok,
    state:
      snapshotState(
        roomId,
        buildUiRoundSummary(
          result.roomResult,
        ),
      ),
    reason:
      result.roomResult.reason,
    ticketCount:
      result.ticketCount,
    grossGold:
      result.grossGold,
    prizePool:
      result.prizePool,
  };
}

export function closeUiTicketRoom(
  roomId: string,
): UiTicketRoomControllerResult {
  return closeUiRoom(
    roomId,
  );
}
