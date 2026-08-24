import {
  closeRoomRound,
  getRoomRoundState,
} from './roomRoundCoordinator';

import {
  processGameEvent,
} from './gameFlowEngine';

import type {
  RoundPatternCandidates,
} from './roundEngine';

import type {
  GameFlowResult,
} from './gameFlowEngine';

export type RoomGameEventInput = {
  roomId: string;
  roundId: string;
  triggerNumber: number;
  virtualGoldUsed: number;
  accumulatedBB: number;
  candidates: RoundPatternCandidates;
};

export type RoomGameEventResult = {
  ok: boolean;
  reason:
    | 'processed'
    | 'room-not-running'
    | 'round-mismatch'
    | 'round-closed'
    | 'processed-and-closed';

  roomStatus:
    | 'waiting'
    | 'running'
    | 'closed'
    | 'missing';

  roundStatus:
    | 'none'
    | 'open'
    | 'running'
    | 'closed';

  flow:
    | GameFlowResult
    | null;
};

/**
 * Final domain gateway for a room event.
 *
 * It refuses to process balls when the room/round relationship
 * is not valid, and otherwise delegates the economic flow to
 * gameFlowEngine.
 */
export function processRoomGameEvent(
  input: RoomGameEventInput,
): RoomGameEventResult {
  const state =
    getRoomRoundState(
      input.roomId,
    );

  if (!state.room) {
    return {
      ok: false,
      reason:
        'room-not-running',
      roomStatus:
        'missing',
      roundStatus:
        'none',
      flow: null,
    };
  }

  if (
    state.room.status !==
    'running'
  ) {
    return {
      ok: false,
      reason:
        'room-not-running',
      roomStatus:
        state.room.status,
      roundStatus:
        state.roundStatus,
      flow: null,
    };
  }

  if (
    state.room.roundId !==
    input.roundId
  ) {
    return {
      ok: false,
      reason:
        'round-mismatch',
      roomStatus:
        state.room.status,
      roundStatus:
        state.roundStatus,
      flow: null,
    };
  }

  if (
    state.roundStatus ===
    'closed'
  ) {
    return {
      ok: false,
      reason:
        'round-closed',
      roomStatus:
        state.room.status,
      roundStatus:
        state.roundStatus,
      flow: null,
    };
  }

  if (
    state.roundStatus !==
    'running'
  ) {
    return {
      ok: false,
      reason:
        'room-not-running',
      roomStatus:
        state.room.status,
      roundStatus:
        state.roundStatus,
      flow: null,
    };
  }

  const flow =
    processGameEvent(
      {
        roundId:
          input.roundId,
        triggerNumber:
          input.triggerNumber,
        virtualGoldUsed:
          input.virtualGoldUsed,
        accumulatedBB:
          input.accumulatedBB,
        candidates:
          input.candidates,
      },
    );

  let nextState =
    state;

  const bingoWasSettled =
    flow.round.settlements.some(
      (settlement) =>
        settlement.category ===
          'bingo' &&
        (
          settlement.status ===
            'paid' ||
          settlement.status ===
            'already-paid'
        ) &&
        (
          settlement.payouts.length >
            0 ||
          settlement.status ===
            'already-paid'
        ),
    );

  const shouldClose =
    flow.finished ||
    bingoWasSettled;

  if (shouldClose) {
    closeRoomRound(
      input.roomId,
    );

    nextState =
      getRoomRoundState(
        input.roomId,
      );
  }

  return {
    ok: true,
    reason:
      shouldClose
        ? 'processed-and-closed'
        : 'processed',
    roomStatus:
      nextState.room?.status ??
      'closed',
    roundStatus:
      nextState.roundStatus,
    flow,
  };
}
