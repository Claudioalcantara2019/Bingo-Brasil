import {
  closeRoomRound,
  getRoomRoundState,
} from './roomRoundCoordinator';

import {
  recordDrawnNumber,
} from './roundStateEngine';

import {
  processGameEvent,
} from './gameFlowEngine';

import type {
  RoundPatternCandidates,
} from './roundEngine';

import type {
  GameFlowResult,
} from './gameFlowEngine';

import {
  filterEligibleRoundWinners,
  registerRoundWinners,
} from './roundWinnerRegistry';

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
    | 'number-already-drawn'
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

function filterRoundCandidates(
  roundId: string,
  candidates: RoundPatternCandidates,
): RoundPatternCandidates {
  return {
    terno:
      filterEligibleRoundWinners(
        roundId,
        'terno',
        candidates.terno,
      ),

    quadra:
      filterEligibleRoundWinners(
        roundId,
        'quadra',
        candidates.quadra,
      ),

    diagonal:
      filterEligibleRoundWinners(
        roundId,
        'diagonal',
        candidates.diagonal,
      ),

    linha:
      filterEligibleRoundWinners(
        roundId,
        'linha',
        candidates.linha,
      ),

    dupla:
      filterEligibleRoundWinners(
        roundId,
        'dupla',
        candidates.dupla,
      ),

    bingo:
      filterEligibleRoundWinners(
        roundId,
        'bingo',
        candidates.bingo,
      ),
  };
}

function registerConfirmedRoundWinners(
  roundId: string,
  triggerNumber: number,
  flow: GameFlowResult,
) {
  for (
    const category of
    flow.round.categories
  ) {
    if (
      category.winners.length ===
      0
    ) {
      continue;
    }

    registerRoundWinners(
      roundId,
      category.category,
      category.winners.map(
        (winner) => ({
          userId:
            winner.userId,
          cardId:
            winner.cardId,
        }),
      ),
      triggerNumber,
    );
  }
}

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

  /*
   * The round state is now the authoritative source for the
   * sequence of drawn numbers. This prevents the UI from
   * accidentally processing the same ball twice.
   */
  const drawResult =
    recordDrawnNumber(
      input.roundId,
      input.triggerNumber,
    );

  if (!drawResult.ok) {
    return {
      ok: false,
      reason:
        drawResult.reason ===
        'number-already-drawn'
          ? 'number-already-drawn'
          : drawResult.reason ===
              'already-closed'
            ? 'round-closed'
            : 'room-not-running',
      roomStatus:
        state.room.status,
      roundStatus:
        state.roundStatus,
      flow: null,
    };
  }

  const eligibleCandidates =
    filterRoundCandidates(
      input.roundId,
      input.candidates,
    );

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
          eligibleCandidates,
      },
    );

  registerConfirmedRoundWinners(
    input.roundId,
    input.triggerNumber,
    flow,
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
