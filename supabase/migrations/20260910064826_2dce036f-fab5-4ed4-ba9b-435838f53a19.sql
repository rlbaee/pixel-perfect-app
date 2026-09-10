CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'Note',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO anon, authenticated;
GRANT ALL ON public.notes TO service_role;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage notes" ON public.notes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '✨',
  accent TEXT NOT NULL DEFAULT 'brand',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habits TO anon, authenticated;
GRANT ALL ON public.habits TO service_role;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage habits" ON public.habits FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.habit_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  day DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (habit_id, day)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habit_checks TO anon, authenticated;
GRANT ALL ON public.habit_checks TO service_role;
ALTER TABLE public.habit_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage habit checks" ON public.habit_checks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.habits (name, emoji, accent, position) VALUES
  ('Drink water', '💧', 'brand', 1),
  ('Read 20 pages', '📖', 'accent', 2),
  ('Morning run', '🏃', 'teal', 3);

INSERT INTO public.notes (category, content) VALUES
  ('Idea', 'Sketch the onboarding flow for the streak celebration — confetti on day 30?'),
  ('Reading', 'Finish chapter 4 of "Field Guide to Calm" before the weekend walk.'),
  ('List', 'Call the podiatrist, water the fiddle-leaf, draft the Q3 retro doc.');