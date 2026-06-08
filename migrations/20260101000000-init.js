'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { UUID, UUIDV4, STRING, TEXT, INTEGER, BOOLEAN, DATE, ENUM } =
      Sequelize;

    await queryInterface.createTable('users', {
      id: { type: UUID, defaultValue: UUIDV4, primaryKey: true },
      email: { type: STRING, allowNull: true, unique: true },
      username: { type: STRING, allowNull: false },
      passwordHash: { type: STRING, allowNull: true },
      role: {
        type: ENUM('facilitator', 'member', 'guest'),
        allowNull: false,
        defaultValue: 'member',
      },
      guestToken: { type: STRING, allowNull: true, unique: true },
      createdAt: { type: DATE, allowNull: false },
      updatedAt: { type: DATE, allowNull: false },
    });

    await queryInterface.createTable('boards', {
      id: { type: UUID, defaultValue: UUIDV4, primaryKey: true },
      title: { type: STRING, allowNull: false },
      sprintNumber: { type: INTEGER, allowNull: false, defaultValue: 1 },
      isVotingOpen: { type: BOOLEAN, allowNull: false, defaultValue: false },
      isCardsHidden: { type: BOOLEAN, allowNull: false, defaultValue: false },
      votesPerUser: { type: INTEGER, allowNull: false, defaultValue: 5 },
      facilitatorId: {
        type: UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      inviteCode: { type: STRING, allowNull: false, unique: true },
      createdAt: { type: DATE, allowNull: false },
      updatedAt: { type: DATE, allowNull: false },
    });

    await queryInterface.createTable('columns', {
      id: { type: UUID, defaultValue: UUIDV4, primaryKey: true },
      boardId: {
        type: UUID,
        allowNull: false,
        references: { model: 'boards', key: 'id' },
        onDelete: 'CASCADE',
      },
      title: { type: STRING, allowNull: false },
      color: { type: STRING, allowNull: false, defaultValue: '#10b981' },
      order: { type: INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { type: DATE, allowNull: false },
      updatedAt: { type: DATE, allowNull: false },
    });

    await queryInterface.createTable('cards', {
      id: { type: UUID, defaultValue: UUIDV4, primaryKey: true },
      columnId: {
        type: UUID,
        allowNull: false,
        references: { model: 'columns', key: 'id' },
        onDelete: 'CASCADE',
      },
      boardId: {
        type: UUID,
        allowNull: false,
        references: { model: 'boards', key: 'id' },
        onDelete: 'CASCADE',
      },
      text: { type: TEXT, allowNull: false },
      authorId: {
        type: UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      isRevealed: { type: BOOLEAN, allowNull: false, defaultValue: false },
      revealedName: { type: STRING, allowNull: true },
      createdAt: { type: DATE, allowNull: false },
      updatedAt: { type: DATE, allowNull: false },
    });

    await queryInterface.createTable('votes', {
      id: { type: UUID, defaultValue: UUIDV4, primaryKey: true },
      cardId: {
        type: UUID,
        allowNull: false,
        references: { model: 'cards', key: 'id' },
        onDelete: 'CASCADE',
      },
      userId: {
        type: UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      boardId: {
        type: UUID,
        allowNull: false,
        references: { model: 'boards', key: 'id' },
        onDelete: 'CASCADE',
      },
      createdAt: { type: DATE, allowNull: false },
      updatedAt: { type: DATE, allowNull: false },
    });

    await queryInterface.addConstraint('votes', {
      fields: ['cardId', 'userId'],
      type: 'unique',
      name: 'votes_card_user_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('votes');
    await queryInterface.dropTable('cards');
    await queryInterface.dropTable('columns');
    await queryInterface.dropTable('boards');
    await queryInterface.dropTable('users');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_users_role";',
    );
  },
};
