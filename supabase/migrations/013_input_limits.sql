-- NOT VALID preserves existing rows for review while enforcing limits on new
-- inserts and updates. Validate these constraints after auditing legacy data.
ALTER TABLE public.users
  ADD CONSTRAINT users_name_limit CHECK (char_length(name) <= 100 AND name ~ '[^[:space:]]') NOT VALID,
  ADD CONSTRAINT users_major_limit CHECK (major IS NULL OR char_length(major) <= 150) NOT VALID,
  ADD CONSTRAINT users_bio_limit CHECK (bio IS NULL OR char_length(bio) <= 300) NOT VALID,
  ADD CONSTRAINT users_status_limit CHECK (status IS NULL OR char_length(status) <= 24) NOT VALID;

ALTER TABLE public.user_prompts
  ADD CONSTRAINT prompts_answer_limit CHECK (char_length(answer) <= 150 AND answer ~ '[^[:space:]]') NOT VALID,
  ADD CONSTRAINT prompts_question_required CHECK (prompt ~ '[^[:space:]]') NOT VALID;

ALTER TABLE public.posts
  ADD CONSTRAINT posts_content_limit CHECK (char_length(content) <= 5000 AND content ~ '[^[:space:]]') NOT VALID,
  ADD CONSTRAINT posts_type_allowed CHECK (type IN ('post', 'question')) NOT VALID;

ALTER TABLE public.comments
  ADD CONSTRAINT comments_content_limit CHECK (char_length(content) <= 500 AND content ~ '[^[:space:]]') NOT VALID;

ALTER TABLE public.messages
  ADD CONSTRAINT messages_content_limit CHECK (char_length(content) <= 4000 AND content ~ '[^[:space:]]') NOT VALID;

ALTER TABLE public.tutor_courses
  ADD CONSTRAINT tutor_group_price_limit CHECK (group_price IS NULL OR group_price BETWEEN 2 AND 10) NOT VALID,
  ADD CONSTRAINT tutor_individual_price_limit CHECK (individual_price IS NULL OR individual_price BETWEEN 10 AND 30) NOT VALID,
  ADD CONSTRAINT tutor_session_type_allowed CHECK (session_type IS NULL OR session_type IN ('online', 'in-person', 'both')) NOT VALID;
