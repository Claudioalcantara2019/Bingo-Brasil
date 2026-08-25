import {
  getRoom,
} from './roomEngine';

import {
  calculateRoundTicketEconomy,
  type RoundTicketEconomy,
} from './roundTicketEconomy';

export type RoomTicketEconomy = {
  roomId: string;
  roundId: string | null;

  playerCount: number;
  ticketCount: number;

  economy:
    RoundTicketEconomy;
};

export function getRoomTicketCount(
  roomId: string,
): number {
  const room =
    getRoom(roomId);

  if (!room) {
    return 0;
  }

  return room.players.reduce(
    (sum, player) =>
      sum +
      player.cardIds.length,
    0,
  );
}

/**
 * Calculates the economy from the cards actually registered
 * in a room.
 *
 * One player may own more than one card, so ticketCount is the
 * sum of all cardIds in the room, not the number of players.
 */
export function calculateRoomTicketEconomy(
  roomId: string,
  ticketValue: number,
  prizeReturnRate = 0.65,
): RoomTicketEconomy {
  const room =
    getRoom(roomId);

  const ticketCount =
    getRoomTicketCount(
      roomId,
    );

  const economy =
    calculateRoundTicketEconomy(
      ticketCount,
      ticketValue,
      prizeReturnRate,
    );

  return {
    roomId,
    roundId:
      room?.roundId ??
      null,

    playerCount:
      room?.players.length ??
      0,

    ticketCount,

    economy,
  };
}
