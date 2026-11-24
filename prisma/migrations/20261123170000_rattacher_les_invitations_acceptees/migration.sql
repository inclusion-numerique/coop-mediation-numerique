UPDATE "coop"."invitations_equipes" ie
SET mediateur_id = m.id
FROM "coop"."users" u
JOIN "coop"."mediateurs" m ON m.user_id = u.id
WHERE lower(u.email) = lower(ie.email)
  AND ie.mediateur_id IS NULL
  AND ie.acceptee IS NOT NULL;
