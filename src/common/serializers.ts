import { Card } from '../database/models/card.model';
import { Board } from '../database/models/board.model';

export interface SerializedCard {
  id: string;
  columnId: string;
  boardId: string;
  text: string | null;
  isHidden: boolean;
  isRevealed: boolean;
  revealedName: string | null;
  authorId?: string;
  isMine: boolean;
  votesCount: number;
  createdAt: Date;
}

/**
 * Serializes a card for a participant.
 * - authorId is NEVER exposed unless `includeAuthor` (facilitator full view).
 * - text is hidden when the board is in "hidden cards" mode and the viewer
 *   is not the author.
 */
export function serializeCard(
  card: Card,
  viewerId: string,
  board: Pick<Board, 'isCardsHidden'>,
  opts: { includeAuthor?: boolean; votesCount?: number } = {},
): SerializedCard {
  const isMine = card.authorId === viewerId;
  const hideText = board.isCardsHidden && !isMine;
  const votesCount =
    opts.votesCount ?? (Array.isArray(card.votes) ? card.votes.length : 0);

  return {
    id: card.id,
    columnId: card.columnId,
    boardId: card.boardId,
    text: hideText ? null : card.text,
    isHidden: hideText,
    isRevealed: card.isRevealed,
    revealedName: card.isRevealed ? card.revealedName : null,
    ...(opts.includeAuthor ? { authorId: card.authorId } : {}),
    isMine,
    votesCount,
    createdAt: card.createdAt,
  };
}
