import {
  ANSWER,
  ICE_CANDIDATE,
  OFFER,
  VIDEO_CALL_REQUEST,
} from '@repo/common/messages';
import { Game } from './Game';
import { User } from './SocketManager';

export class RoomManager {
  private getReceivingUser(game: Game, users: User[], senderSocketid: string) {
    const receivingUserId =
      game.player1UserId === senderSocketid
        ? game.player2UserId
        : game.player1UserId;

    return users.find((user) => user.userId === receivingUserId);
  }

  onRequest(game: Game, users: User[], senderSocketid: string) {
    const receivingUser = this.getReceivingUser(game, users, senderSocketid);

    receivingUser?.socket.send(
      JSON.stringify({
        type: VIDEO_CALL_REQUEST,
        payload: {
          gameId: game.gameId,
          senderSocketid,
        },
      }),
    );
  }

  onOffer(game: Game, users: User[], sdp: string, senderSocketid: string) {
    const receivingUser = this.getReceivingUser(game, users, senderSocketid);

    receivingUser?.socket.send(
      JSON.stringify({
        type: OFFER,
        payload: {
          remoteSdp: sdp,
          gameId: game.gameId,
        },
      }),
    );
  }

  onAnswer(game: Game, users: User[], sdp: string, senderSocketid: string) {
    const receivingUser = this.getReceivingUser(game, users, senderSocketid);

    receivingUser?.socket.send(
      JSON.stringify({
        type: ANSWER,
        payload: {
          remoteSdp: sdp,
          game: game.gameId,
        },
      }),
    );
  }

  onIceCandidates(
    game: Game,
    users: User[],
    senderSocketid: string,
    candidate: any,
    type: 'sender' | 'receiver',
  ) {
    const receivingUser = this.getReceivingUser(game, users, senderSocketid);

    receivingUser?.socket.send(
      JSON.stringify({
        type: ICE_CANDIDATE,
        payload: {
          candidate,
          type,
        },
      }),
    );
  }
}
