-- Adiciona o campo status (caso ainda não tenha adicionado com sucesso)
ALTER TABLE chats ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT NULL;

-- Função auxiliar Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql Security Definer
AS $$
DECLARE
  v_role public.user_role;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE user_id = user_uuid;
  RETURN v_role = 'SUPER_ADMIN';
END;
$$;

-- Remove as políticas velhas
DROP POLICY IF EXISTS "Allow full access to own chats" ON chats;
DROP POLICY IF EXISTS "Allow view access to non-private chats" ON chats;
DROP POLICY IF EXISTS "Allow select own non-deleted chats or all if super admin" ON chats;
DROP POLICY IF EXISTS "Allow insert own chats" ON chats;
DROP POLICY IF EXISTS "Allow update own chats" ON chats;
DROP POLICY IF EXISTS "Allow delete for super admins only" ON chats;
DROP POLICY IF EXISTS "Allow view access to non-private non-deleted chats" ON chats;

-- Recria com a correção do SUPABASE PostgREST RLS
CREATE POLICY "Allow insert own chats" ON chats FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Allow update own chats" ON chats FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Allow delete for super admins only" ON chats FOR DELETE USING (public.is_super_admin(auth.uid()));

-- Aqui está o SEGREDO da correção: 
CREATE POLICY "Allow select own chats or all if super admin"
    ON chats FOR SELECT
    USING (user_id = auth.uid() OR public.is_super_admin(auth.uid()));

CREATE POLICY "Allow view access to non-private non-deleted chats"
    ON chats FOR SELECT
    USING (sharing <> 'private' AND status IS DISTINCT FROM 'DELETED');
