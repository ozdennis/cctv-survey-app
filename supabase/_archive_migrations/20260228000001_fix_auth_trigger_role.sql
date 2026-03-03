-- Fix the Auth Trigger to use the new `roles` array instead of the deleted `role` column
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
DECLARE is_first_user boolean;
BEGIN
SELECT NOT EXISTS(
        SELECT 1
        FROM public.users
    ) INTO is_first_user;
INSERT INTO public.users (id, name, roles)
VALUES (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
        CASE
            WHEN is_first_user THEN ARRAY ['Admin']
            ELSE ARRAY ['Vendor']
        END
    );
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;