export type RoomStatus =
  | 'waiting'
  | 'running'
  | 'closed';

export type RoomPlayer = {
  userId: string;
  cardIds: string[];
  joinedAt: number;
};

export type RoomState = {
  roomId: string;
  status: RoomStatus;
  maxPlayers: number;
  players: RoomPlayer[];
  roundId: string | null;
};

export type RoomResult = {
  ok: boolean;
  state: RoomState;
  reason:
    | 'created'
    | 'joined'
    | 'already-joined'
    | 'removed'
    | 'started'
    | 'closed'
    | 'already-running'
    | 'already-closed'
    | 'room-full'
    | 'cannot-join'
    | 'cannot-start'
    | 'invalid-room'
    | 'invalid-player';
};

const rooms =
  new Map<string, RoomState>();

function cloneRoom(
  room: RoomState,
): RoomState {
  return {
    ...room,
    players:
      room.players.map(
        (player) => ({
          ...player,
          cardIds: [
            ...player.cardIds,
          ],
        }),
      ),
  };
}

export function clearRoomTestStore() {
  rooms.clear();
}

export function createRoom(
  roomId: string,
  maxPlayers = 100,
): RoomResult {
  if (
    !roomId ||
    maxPlayers < 1
  ) {
    return {
      ok: false,
      state: {
        roomId,
        status: 'waiting',
        maxPlayers: Math.max(
          1,
          maxPlayers,
        ),
        players: [],
        roundId: null,
      },
      reason:
        'invalid-room',
    };
  }

  const existing =
    rooms.get(roomId);

  if (existing) {
    return {
      ok: true,
      state:
        cloneRoom(existing),
      reason:
        existing.status ===
        'closed'
          ? 'already-closed'
          : existing.status ===
            'running'
            ? 'already-running'
            : 'created',
    };
  }

  const room: RoomState = {
    roomId,
    status: 'waiting',
    maxPlayers,
    players: [],
    roundId: null,
  };

  rooms.set(
    roomId,
    room,
  );

  return {
    ok: true,
    state:
      cloneRoom(room),
    reason: 'created',
  };
}

export function joinRoom(
  roomId: string,
  userId: string,
  cardIds: string[],
): RoomResult {
  const room =
    rooms.get(roomId);

  if (
    !room ||
    !userId
  ) {
    return {
      ok: false,
      state:
        room
          ? cloneRoom(room)
          : {
              roomId,
              status: 'waiting',
              maxPlayers: 0,
              players: [],
              roundId: null,
            },
      reason:
        !room
          ? 'invalid-room'
          : 'invalid-player',
    };
  }

  if (
    room.status !==
    'waiting'
  ) {
    return {
      ok: false,
      state:
        cloneRoom(room),
      reason:
        'cannot-join',
    };
  }

  const existing =
    room.players.find(
      (player) =>
        player.userId ===
        userId,
    );

  if (existing) {
    return {
      ok: true,
      state:
        cloneRoom(room),
      reason:
        'already-joined',
    };
  }

  if (
    room.players.length >=
    room.maxPlayers
  ) {
    return {
      ok: false,
      state:
        cloneRoom(room),
      reason:
        'room-full',
    };
  }

  const uniqueCards =
    [
      ...new Set(
        cardIds.filter(
          (cardId) =>
            Boolean(cardId),
        ),
      ),
    ];

  room.players.push({
    userId,
    cardIds:
      uniqueCards,
    joinedAt:
      Date.now(),
  });

  return {
    ok: true,
    state:
      cloneRoom(room),
    reason:
      'joined',
  };
}

export function leaveRoom(
  roomId: string,
  userId: string,
): RoomResult {
  const room =
    rooms.get(roomId);

  if (
    !room ||
    !userId
  ) {
    return {
      ok: false,
      state:
        room
          ? cloneRoom(room)
          : {
              roomId,
              status: 'waiting',
              maxPlayers: 0,
              players: [],
              roundId: null,
            },
      reason:
        !room
          ? 'invalid-room'
          : 'invalid-player',
    };
  }

  if (
    room.status !==
    'waiting'
  ) {
    return {
      ok: false,
      state:
        cloneRoom(room),
      reason:
        'cannot-join',
    };
  }

  const before =
    room.players.length;

  room.players =
    room.players.filter(
      (player) =>
        player.userId !==
        userId,
    );

  return {
    ok:
      room.players.length <
      before,
    state:
      cloneRoom(room),
    reason:
      room.players.length <
      before
        ? 'removed'
        : 'invalid-player',
  };
}

export function startRoom(
  roomId: string,
  roundId: string,
): RoomResult {
  const room =
    rooms.get(roomId);

  if (!room || !roundId) {
    return {
      ok: false,
      state:
        room
          ? cloneRoom(room)
          : {
              roomId,
              status: 'waiting',
              maxPlayers: 0,
              players: [],
              roundId: null,
            },
      reason:
        !room
          ? 'invalid-room'
          : 'cannot-start',
    };
  }

  if (
    room.status ===
    'closed'
  ) {
    return {
      ok: false,
      state:
        cloneRoom(room),
      reason:
        'already-closed',
    };
  }

  if (
    room.status ===
    'running'
  ) {
    return {
      ok: true,
      state:
        cloneRoom(room),
      reason:
        'already-running',
    };
  }

  if (
    room.players.length ===
    0
  ) {
    return {
      ok: false,
      state:
        cloneRoom(room),
      reason:
        'cannot-start',
    };
  }

  room.status = 'running';
  room.roundId =
    roundId;

  return {
    ok: true,
    state:
      cloneRoom(room),
    reason:
      'started',
  };
}

export function closeRoom(
  roomId: string,
): RoomResult {
  const room =
    rooms.get(roomId);

  if (!room) {
    return {
      ok: false,
      state: {
        roomId,
        status: 'waiting',
        maxPlayers: 0,
        players: [],
        roundId: null,
      },
      reason:
        'invalid-room',
    };
  }

  if (
    room.status ===
    'closed'
  ) {
    return {
      ok: true,
      state:
        cloneRoom(room),
      reason:
        'already-closed',
    };
  }

  room.status = 'closed';

  return {
    ok: true,
    state:
      cloneRoom(room),
    reason:
      'closed',
  };
}

export function getRoom(
  roomId: string,
): RoomState | null {
  const room =
    rooms.get(roomId);

  return room
    ? cloneRoom(room)
    : null;
}
