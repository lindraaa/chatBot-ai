/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  pgm.sql('CREATE EXTENSION IF NOT EXISTS vector');

  pgm.createTable('documents', {
    id: { type: 'UUID', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    file_name: { type: 'TEXT', notNull: true },
    storage_path: { type: 'TEXT', notNull: true, unique: true },
    file_size: { type: 'BIGINT', notNull: true },
    mime_type: { type: 'TEXT', notNull: true },
    status: { type: 'TEXT', notNull: true, default: 'processing' },
    error_message: { type: 'TEXT' },
    created_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
    updated_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });

  pgm.addConstraint('documents', 'documents_status_check', {
    check: "status IN ('processing', 'ready', 'failed')",
  });

  pgm.createTable('document_chunks', {
    id: { type: 'UUID', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    document_id: { type: 'UUID', notNull: true },
    chunk_index: { type: 'INTEGER', notNull: true },
    content: { type: 'TEXT', notNull: true },
    embedding: { type: 'vector(768)', notNull: true },
    metadata: { type: 'JSONB', notNull: true, default: '{}' },
    created_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });

  pgm.addConstraint('document_chunks', 'fk_document_chunks_document_id', {
    foreignKeys: {
      columns: 'document_id',
      references: 'documents(id)',
      onDelete: 'CASCADE',
    },
  });
  pgm.addConstraint('document_chunks', 'document_chunks_document_index_unique', {
    unique: ['document_id', 'chunk_index'],
  });
  pgm.createIndex('document_chunks', 'document_id');
  pgm.sql(
    'CREATE INDEX document_chunks_embedding_idx ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)'
  );

  pgm.sql(`
    CREATE OR REPLACE FUNCTION match_document_chunks(
      query_embedding vector(768),
      match_count integer,
      similarity_threshold double precision
    )
    RETURNS TABLE (
      id uuid,
      document_id uuid,
      content text,
      metadata jsonb,
      similarity double precision
    )
    LANGUAGE sql
    STABLE
    AS $$
      SELECT
        dc.id,
        dc.document_id,
        dc.content,
        dc.metadata,
        1 - (dc.embedding <=> query_embedding) AS similarity
      FROM document_chunks dc
      JOIN documents d ON d.id = dc.document_id
      WHERE d.status = 'ready'
        AND 1 - (dc.embedding <=> query_embedding) >= similarity_threshold
      ORDER BY dc.embedding <=> query_embedding
      LIMIT match_count;
    $$;
  `);
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const down = (pgm) => {
  pgm.sql('DROP FUNCTION IF EXISTS match_document_chunks(vector, integer, double precision)');
  pgm.dropTable('document_chunks');
  pgm.dropTable('documents');
};
