-- This migration adds an index on topic_likes(topicId) to speed up COUNT and lookup queries.
-- If the index already exists, Postgres will skip creation thanks to IF NOT EXISTS.

-- CreateIndex
CREATE INDEX IF NOT EXISTS "topic_likes_topicId_idx" ON "topic_likes"("topicId");