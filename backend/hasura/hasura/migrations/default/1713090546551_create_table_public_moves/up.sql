CREATE TABLE "public"."moves" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "game_id" uuid NOT NULL, "after_fen" text NOT NULL, "lan" text NOT NULL, "san" text NOT NULL, "flags" text NOT NULL, "from" text NOT NULL, "to" text NOT NULL, "piece" text NOT NULL, "color" text NOT NULL, "before_fen" text NOT NULL, "captured" text, "promotion" text, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id","game_id") , FOREIGN KEY ("game_id") REFERENCES "public"."game"("id") ON UPDATE no action ON DELETE no action, UNIQUE ("id"));COMMENT ON TABLE "public"."moves" IS E'moves for game';
CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_public_moves_updated_at"
BEFORE UPDATE ON "public"."moves"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_moves_updated_at" ON "public"."moves" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
