import {
  buildRoomRoundEconomyGate,
} from './roomRoundEconomyGate';

import {
  processRoomGameEvent,
  type RoomGameEventResult,
} from './roomGameEngine';

import type {
  RoundPatternCandidates,
} from './roundEngine';

export type RoomTicketGameEventInput = {
  roomId: string;
  roundId: string;
  triggerNumber: number;

  ticketValue: number;
  accumulatedBB: number;

  candidates:
    RoundPatternCandidates;
};

export type RoomTicketGameEventResult = {
  roomResult:
    RoomGameEventResult;

  ticketCount: number;
  grossGold: number;
  prizePool: number;
};

/**
 * Authoritative ticket-based gateway.
 *
 * The caller provides the room, round, ticket value and candidates.
 * The number of tickets is read from roomEngine and the gross
 * revenue is calculated automatically.
 *
 * The legacy roomGameEngine contract remains available for
 * compatibility; this adapter is the preferred path for real
 * ticket-driven rounds.
 */
export function processRoomGameEventFromTickets(
  input: RoomTicketGameEventInput,
): RoomTicketGameEventResult {
  const gate =
    buildRoomRoundEconomyGate(
      input.roomId,
      input.roundId,
      input.ticketValue,
      input.accumulatedBB,
      input.candidates,
    );

  const roomResult =
    processRoomGameEvent({
      roomId:
        input.roomId,
      roundId:
        input.roundId,
      triggerNumber:
        input.triggerNumber,
      virtualGoldUsed:
        gate.economy.economy.grossGold,
      accumulatedBB:
        input.accumulatedBB,
      candidates:
        input.candidates,
    });

  return {
    roomResult,
    ticketCount:
      gate.economy.ticketCount,
    grossGold:
      gate.economy.economy.grossGold,
    prizePool:
      gate.economy.economy.prizePool,
  };
}
