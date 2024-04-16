alter table "public"."game" drop constraint "needed atleast one player to create a row";
alter table "public"."game" add constraint "need" check (CHECK (black_player_id IS NULL AND white_player_id IS NOT NULL OR white_player_id IS NULL AND black_player_id IS NOT NULL OR white_player_id IS NOT NULL AND black_player_id IS NOT NULL));
