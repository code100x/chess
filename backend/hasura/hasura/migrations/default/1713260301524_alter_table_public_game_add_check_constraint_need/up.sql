alter table "public"."game" add constraint "need" check ((black_player_id IS NULL AND white_player_id IS NOT NULL) OR 
(white_player_id IS NULL AND black_player_id IS NOT NULL) OR
(white_player_id IS NOT NULL AND black_player_id IS NOT NULL));
