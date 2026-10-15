-- Starting data. Team sizes, fees and dates are placeholders: edit them in the admin dashboard.

insert into public.competitions (slug, name, type, description, min_members, max_members, fee)
values
  ('competitive-programming', 'Competitive Programming', 'competitive_programming',
   'Solve algorithmic problems in Python, C++ or Java.', 1, 3, 0),
  ('category-2', 'Category 2', 'logic',
   'Logic and problem-solving competition.', 1, 3, 0)
on conflict (slug) do nothing;

insert into public.cp_sessions (competition_id)
select id from public.competitions where slug = 'competitive-programming'
on conflict (competition_id) do nothing;

-- Make yourself an admin after signing in once:
-- update public.profiles set role = 'admin' where email = 'you@example.com';
