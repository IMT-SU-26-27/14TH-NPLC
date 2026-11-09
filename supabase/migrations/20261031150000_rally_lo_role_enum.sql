-- A new enum value can't be used in the transaction that adds it, so it has its own migration.
alter type public.user_role add value if not exists 'lo';
