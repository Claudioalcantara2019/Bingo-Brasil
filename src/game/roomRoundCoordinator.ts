import {
  closeRoom,
  createRoom,
  getRoom,
  joinRoom,
  startRoom,
  type RoomResult,
  type RoomState,
} from './roomEngine';

import {
  closeRound,
  createRound,
  getRoundState,
  startRound,
  type RoundStateResult,
} from './roundStateEngine';

export type RoomRoundState = {
  room: RoomState | null;
  roundStatus:
    | 'none'
    | 'open'
    | 'running'
    | 'closed';
};

export type RoomRoundResult = {
  ok: boolean;
  state: RoomRoundState;
  reason:
    | 'room-created'
    | 'player-joined'
    | 'already-joined'
    | 'room-started'
    | 'already-running'
    | 'round-started'
    | 'round-already-running'
    | 'round-closed'
    | 'room-closed'
    | 'invalid-room'
    | 'cannot-start'
    | 'already-closed'
    | 'cannot-join';
};

function readState(
  roomId: string,
): RoomRoundState {
  const room =
    getRoom(roomId);

  if (!room) {
    return {
      room: null,
      roundStatus: 'none',
    };
  }

  if (!room.roundId) {
    return {
      room,
      roundStatus: 'none',
    };
  }

  const round =
    getRoundState(
      room.roundId,
    );

  return {
    room,
    roundStatus:
      round?.status ??
      'none',
  };
}

export function createRoomRound(
  roomId: string,
  maxPlayers = 100,
): RoomRoundResult {
  const roomResult =
    createRoom(
      roomId,
      maxPlayers,
    );

  return {
    ok:
      roomResult.ok,
    state:
      readState(roomId),
    reason:
      roomResult.ok
        ? 'room-created'
        : 'invalid-room',
  };
}

export function joinRoomPlayer(
  roomId: string,
  userId: string,
  cardIds: string[],
): RoomRoundResult {
  const result =
    joinRoom(
      roomId,
      userId,
      cardIds,
    );

  let reason:
    | 'player-joined'
    | 'already-joined'
    | 'cannot-join'
    | 'invalid-room';

  if (!result.ok) {
    reason =
      result.reason ===
      'invalid-room'
        ? 'invalid-room'
        : 'cannot-join';
  } else if (
    result.reason ===
    'already-joined'
  ) {
    reason =
      'already-joined';
  } else {
    reason =
      'player-joined';
  }

  return {
    ok:
      result.ok,
    state:
      readState(roomId),
    reason,
  };
}

export function startRoomRound(
  roomId: string,
  roundId: string,
): RoomRoundResult {
  const roomResult =
    startRoom(
      roomId,
      roundId,
    );

  if (!roomResult.ok) {
    return {
      ok: false,
      state:
        readState(roomId),
      reason:
        roomResult.reason ===
        'already-closed'
          ? 'already-closed'
          : 'cannot-start',
    };
  }

  /*
   * A room can be running while its round has just been created.
   * The coordinator makes the round transition in the same command.
   */
  const roundCreated =
    createRound(
      roundId,
    );

  if (
    !roundCreated.ok
  ) {
    return {
      ok: false,
      state:
        readState(roomId),
      reason:
        'cannot-start',
    };
  }

  const roundStarted =
    startRound(
      roundId,
    );

  if (
    !roundStarted.ok &&
    roundStarted.reason !==
      'already-running'
  ) {
    return {
      ok: false,
      state:
        readState(roomId),
      reason:
        'cannot-start',
    };
  }

  return {
    ok: true,
    state:
      readState(roomId),
    reason:
      roundStarted.reason ===
      'already-running'
        ? 'round-already-running'
        : 'round-started',
  };
}

export function closeRoomRound(
  roomId: string,
): RoomRoundResult {
  const current =
    getRoom(roomId);

  if (!current) {
    return {
      ok: false,
      state:
        readState(roomId),
      reason:
        'invalid-room',
    };
  }

  if (
    current.roundId
  ) {
    const round =
      getRoundState(
        current.roundId,
      );

    if (
      round &&
      round.status !==
        'closed'
    ) {
      closeRound(
        current.roundId,
      );
    }
  }

  const roomResult =
    closeRoom(
      roomId,
    );

  return {
    ok:
      roomResult.ok,
    state:
      readState(roomId),
    reason:
      roomResult.reason ===
      'already-closed'
        ? 'already-closed'
        : 'room-closed',
  };
}

export function getRoomRoundState(
  roomId: string,
): RoomRoundState {
  return readState(
    roomId,
  );
}
