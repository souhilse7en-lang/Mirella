-- Autoriser la lecture publique des communes (anon key)
ALTER TABLE communes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "communes_public_read"
  ON communes
  FOR SELECT
  TO public
  USING (true);
