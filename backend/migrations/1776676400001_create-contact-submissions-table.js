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

  pgm.createTable('contact_submissions', {
    id: { type: 'UUID', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    session_id: { type: 'TEXT' },
    name: { type: 'TEXT', notNull: true },
    email: { type: 'TEXT', notNull: true },
    phone: { type: 'TEXT' },
    conversation_summary: { type: 'TEXT' },
    unanswered_question: { type: 'TEXT' },
    created_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });

  pgm.addConstraint('contact_submissions', 'fk_contact_submissions_session_id', {
    foreignKeys: {
      columns: 'session_id',
      references: 'sessions(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.createIndex('contact_submissions', 'session_id');
  pgm.createIndex('contact_submissions', 'email');
  pgm.createIndex('contact_submissions', 'created_at');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('contact_submissions');
};
