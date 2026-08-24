export type RoundStatus =
  | 'open'
  | 'running'
  | 'closed';

export type RoundState = {
  roundId: string;
  status: RoundStatus;
  lastNumber: number | null;
  drawCount: number;
};

export type RoundStateResult = {
  ok: boolean;
  state: RoundState;
  reason:
    | 'created'
    | 'started'
    | 'number-recorded'
    | 'closed'
    | 'already-closed'
    | 'already-running'
    | 'invalid-number'
    | 'invalid-state';
};

const states = new Map<string, RoundState>();

export function clearRoundStateTestStore() {
  states.clear();
}

export function createRound(
  roundId: string,
): RoundStateResult {
  if (!roundId) {
    return {
      ok: false,
      state: {
        roundId: '',
        status: 'open',
        lastNumber: null,
        drawCount: 0,
      },
      reason: 'invalid-state',
    };
  }

  const existing = states.get(roundId);

  if (existing) {
    return {
      ok: true,
      state: { ...existing },
      reason:
        existing.status === 'closed'
          ? 'already-closed'
          : 'already-running',
    };
  }

  const state: RoundState = {
    roundId,
    status: 'open',
    lastNumber: null,
    drawCount: 0,
  };

  states.set(roundId, state);

  return {
    ok: true,
    state: { ...state },
    reason: 'created',
  };
}

export function startRound(
  roundId: string,
): RoundStateResult {
  const current = states.get(roundId);

  if (!current) {
    return {
      ok: false,
      state: {
        roundId,
        status: 'open',
        lastNumber: null,
        drawCount: 0,
      },
      reason: 'invalid-state',
    };
  }

  if (current.status === 'closed') {
    return {
      ok: false,
      state: { ...current },
      reason: 'already-closed',
    };
  }

  if (current.status === 'running') {
    return {
      ok: true,
      state: { ...current },
      reason: 'already-running',
    };
  }

  const next = {
    ...current,
    status: 'running' as const,
  };

  states.set(roundId, next);

  return {
    ok: true,
    state: { ...next },
    reason: 'started',
  };
}

export function recordDrawnNumber(
  roundId: string,
  number: number,
): RoundStateResult {
  const current = states.get(roundId);

  if (!current) {
    return {
      ok: false,
      state: {
        roundId,
        status: 'open',
        lastNumber: null,
        drawCount: 0,
      },
      reason: 'invalid-state',
    };
  }

  if (number < 1 || number > 75) {
    return {
      ok: false,
      state: { ...current },
      reason: 'invalid-number',
    };
  }

  if (current.status === 'closed') {
    return {
      ok: false,
      state: { ...current },
      reason: 'already-closed',
    };
  }

  if (current.status !== 'running') {
    return {
      ok: false,
      state: { ...current },
      reason: 'invalid-state',
    };
  }

  const next = {
    ...current,
    lastNumber: number,
    drawCount: current.drawCount + 1,
  };

  states.set(roundId, next);

  return {
    ok: true,
    state: { ...next },
    reason: 'number-recorded',
  };
}

export function closeRound(
  roundId: string,
): RoundStateResult {
  const current = states.get(roundId);

  if (!current) {
    return {
      ok: false,
      state: {
        roundId,
        status: 'open',
        lastNumber: null,
        drawCount: 0,
      },
      reason: 'invalid-state',
    };
  }

  if (current.status === 'closed') {
    return {
      ok: true,
      state: { ...current },
      reason: 'already-closed',
    };
  }

  const next = {
    ...current,
    status: 'closed' as const,
  };

  states.set(roundId, next);

  return {
    ok: true,
    state: { ...next },
    reason: 'closed',
  };
}

export function getRoundState(
  roundId: string,
): RoundState | null {
  const state = states.get(roundId);
  return state ? { ...state } : null;
}
