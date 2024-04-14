alter table "public"."game" add constraint "black_player is not white_player" check ((black_player <> white_player));
