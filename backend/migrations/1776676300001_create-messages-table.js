/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  // Enable pgcrypto extension for UUID generation
  pgm.createExtension('pgcrypto', { ifNotExists: true });

  pgm.createTable('messages', {
    id: { type: 'UUID', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    session_id: { type: 'TEXT', notNull: true },
    role: { type: 'TEXT', notNull: true },
    content: { type: 'TEXT', notNull: true },
    topic: { type: 'TEXT' },
    is_unknown: { type: 'BOOLEAN', notNull: true, default: false },
    created_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });

  pgm.addConstraint('messages', 'fk_messages_session_id', {
    foreignKeys: {
      columns: 'session_id',
      references: 'sessions(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.createIndex('messages', 'session_id');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('messages');
};
