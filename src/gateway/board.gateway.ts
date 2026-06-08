import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

interface Participant {
  id: string;
  username: string;
  role: string;
}

const wsCorsOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean) as string[];

@WebSocketGateway({
  cors: { origin: wsCorsOrigins.length ? wsCorsOrigins : '*', credentials: true },
})
export class BoardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(BoardGateway.name);
  // boardId -> socketId -> participant
  private rooms = new Map<string, Map<string, Participant>>();
  // boardId -> socketId -> columnId (anonymous typing indicator)
  private typing = new Map<string, Map<string, string>>();

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    for (const [boardId, members] of this.rooms.entries()) {
      if (members.has(client.id)) {
        members.delete(client.id);
        this.emitParticipants(boardId);
      }
      const typers = this.typing.get(boardId);
      if (typers?.delete(client.id)) {
        this.broadcastTyping(boardId);
      }
    }
  }

  private roomName(boardId: string) {
    return `board:${boardId}`;
  }

  @SubscribeMessage('join-board')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string; user?: Participant },
  ) {
    const { boardId, user } = data;
    client.join(this.roomName(boardId));
    if (!this.rooms.has(boardId)) this.rooms.set(boardId, new Map());
    if (user) {
      this.rooms.get(boardId)!.set(client.id, user);
    }
    this.emitParticipants(boardId);
    client.emit('card:typing', { typing: this.getColumnTypingCounts(boardId) });
    return { ok: true };
  }

  @SubscribeMessage('leave-board')
  handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string },
  ) {
    const { boardId } = data;
    client.leave(this.roomName(boardId));
    this.rooms.get(boardId)?.delete(client.id);
    this.typing.get(boardId)?.delete(client.id);
    this.emitParticipants(boardId);
    this.broadcastTyping(boardId);
    return { ok: true };
  }

  @SubscribeMessage('card:typing-start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string; columnId: string },
  ) {
    const { boardId, columnId } = data;
    if (!this.typing.has(boardId)) this.typing.set(boardId, new Map());
    this.typing.get(boardId)!.set(client.id, columnId);
    this.broadcastTyping(boardId, client.id);
    return { ok: true };
  }

  @SubscribeMessage('card:typing-stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string; columnId: string },
  ) {
    const { boardId, columnId } = data;
    const typers = this.typing.get(boardId);
    if (typers?.get(client.id) === columnId) typers.delete(client.id);
    this.broadcastTyping(boardId, client.id);
    return { ok: true };
  }

  private getColumnTypingCounts(boardId: string): Record<string, number> {
    const counts: Record<string, number> = {};
    this.typing.get(boardId)?.forEach((columnId) => {
      counts[columnId] = (counts[columnId] || 0) + 1;
    });
    return counts;
  }

  private broadcastTyping(boardId: string, excludeSocketId?: string) {
    const payload = { typing: this.getColumnTypingCounts(boardId) };
    const room = this.roomName(boardId);
    if (excludeSocketId) {
      this.server.to(room).except(excludeSocketId).emit('card:typing', payload);
    } else {
      this.server.to(room).emit('card:typing', payload);
    }
  }

  private emitParticipants(boardId: string) {
    const members = this.rooms.get(boardId);
    const unique = new Map<string, Participant>();
    members?.forEach((p) => unique.set(p.id, p));
    this.server
      .to(this.roomName(boardId))
      .emit('participants:updated', { participants: [...unique.values()] });
  }

  // ---- Emitters used by services ----
  emitCardCreated(boardId: string, card: unknown) {
    this.server.to(this.roomName(boardId)).emit('card:created', { card });
  }

  emitCardUpdated(boardId: string, card: unknown) {
    this.server.to(this.roomName(boardId)).emit('card:updated', { card });
  }

  emitCardDeleted(boardId: string, cardId: string) {
    this.server.to(this.roomName(boardId)).emit('card:deleted', { cardId });
  }

  emitVoteChanged(boardId: string, cardId: string, votesCount: number) {
    this.server
      .to(this.roomName(boardId))
      .emit('vote:changed', { cardId, votesCount });
  }

  emitBoardUpdated(boardId: string, board: unknown) {
    this.server.to(this.roomName(boardId)).emit('board:updated', { board });
  }

  emitColumnUpdated(boardId: string, column: unknown) {
    this.server.to(this.roomName(boardId)).emit('column:updated', { column });
  }
}
