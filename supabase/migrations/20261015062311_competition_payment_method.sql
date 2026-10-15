-- Payment method per competition: a QRIS image, or a transfer to a BCA account.
create type public.payment_method as enum ('qris', 'bank_transfer');

alter table public.competitions
  add column payment_method public.payment_method not null default 'qris',
  add column bank_account_number text check (bank_account_number is null or bank_account_number ~ '^[0-9]{6,20}$'),
  add column bank_account_holder text check (bank_account_holder is null or char_length(btrim(bank_account_holder)) between 2 and 100),
  add constraint competitions_bank_details_required check (
    payment_method <> 'bank_transfer' or (bank_account_number is not null and bank_account_holder is not null)
  );
