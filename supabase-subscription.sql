-- ============================================
-- AdBoost : Table des abonnements
-- ============================================

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan text NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter','essentiel','pro','premium')),
  generations_utilisees integer NOT NULL DEFAULT 0,
  generations_max integer NOT NULL DEFAULT 1,
  periode_debut timestamptz NOT NULL DEFAULT now(),
  periode_fin timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- L'utilisateur ne voit que son propre abonnement
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- L'utilisateur peut mettre à jour son propre abonnement (pour l'incrément côté API)
CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- L'insertion se fait via le service ou l'utilisateur lui-même
CREATE POLICY "Users can insert own subscription" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
