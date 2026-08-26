import type { UiRoomSession } from './uiRoomSession';
import { buildUiRoomViewModel, type UiRoomViewModel } from './uiRoomViewModel';

export type UiRoomPresentation = {
  roomId: string;
  roundId: string | null;
  header: {
    roomStatus: string;
    roundStatus: string;
    connection: string;
    players: string;
  };
  round: {
    id: string;
    lastNumber: string;
    drawCount: number;
    drawnNumbers: number[];
    banner: string;
    blocked: boolean;
  };
  economy: {
    goldPaid: string;
    bbPaid: string;
  };
  prizes: UiRoomViewModel['prizes'];
};

export function buildUiRoomPresentation(
  session: UiRoomSession,
): UiRoomPresentation {
  const state = session.state;
  const view = buildUiRoomViewModel(state);

  return {
    roomId: state.roomId,
    roundId: state.roundId,
    header: {
      roomStatus: view.roomStatusText,
      roundStatus: view.roundStatusText,
      connection: view.connectionText,
      players: view.playerCountText,
    },
    round: {
      id: view.roundIdText,
      lastNumber: view.lastNumberText,
      drawCount: state.view.drawCount,
      drawnNumbers: [
        ...state.view.drawnNumbers,
      ],
      banner: view.bannerText,
      blocked: view.blocked,
    },
    economy: {
      goldPaid: view.totalGoldPaidText,
      bbPaid: view.totalBBPaidText,
    },
    prizes: view.prizes,
  };
}
