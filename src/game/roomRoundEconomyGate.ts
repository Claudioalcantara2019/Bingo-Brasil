import {
  calculateRoomTicketEconomy,
  type RoomTicketEconomy,
} from './roomTicketEconomy';

import type {
  RoundInput,
  RoundPatternCandidates,
} from './roundEngine';

export type RoomRoundEconomyGate = {
  roomId: string;
  roundId: string;

  ticketValue: number;

  economy:
    RoomTicketEconomy;

  roundInput:
    RoundInput;
};

/**
 * Builds the authoritative RoundInput from the cards registered
 * in the room.
 *
 * The returned virtualGoldUsed is no longer a manually invented
 * number: it comes from ticketCount * ticketValue.
 */
export function buildRoomRoundEconomyGate(
  roomId: string,
  roundId: string,
  ticketValue: number,
  accumulatedBB: number,
  candidates: RoundPatternCandidates,
  prizeReturnRate = 0.65,
): RoomRoundEconomyGate {
  const economy =
    calculateRoomTicketEconomy(
      roomId,
      ticketValue,
      prizeReturnRate,
    );

  const roundInput: RoundInput = {
    roundId,
    triggerNumber: 1,
    virtualGoldUsed:
      economy.economy.grossGold,
    accumulatedBB,
    candidates,
  };

  return {
    roomId,
    roundId,
    ticketValue,
    economy,
    roundInput,
  };
}
