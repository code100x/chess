import { ANSWER, ICE_CANDIDATE, OFFER } from '@repo/common/messages';
import { Game } from './Game';
import { User } from './SocketManager';

export class RoomManager {
  onOffer(game: Game, users: User[], sdp: string, senderSocketid: string) {
    const receivingUserId =
      game.player1UserId === senderSocketid
        ? game.player2UserId
        : game.player1UserId;

    const receivingUser = users.find((user) => user.userId === receivingUserId);

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
    const receivingUserId =
      game.player1UserId === senderSocketid
        ? game.player2UserId
        : game.player1UserId;

    const receivingUser = users.find((user) => user.userId === receivingUserId);

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
    const receivingUserId =
      game.player1UserId === senderSocketid
        ? game.player2UserId
        : game.player1UserId;

    const receivingUser = users.find((user) => user.userId === receivingUserId);

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
