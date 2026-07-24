import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'

type PrismaLike = Prisma.TransactionClient

// Garantit qu'une ligne `main.personne` existe et porte le `coop_id` du user coop (ADR-002, périmètre
// élargi 2026-07-23). Trois cas, l'email servant de pivot (décision Marc) :
//   1. déjà reliée (coop_id posé) -> on la renvoie ;
//   2. existe via un AUTRE flux (idposte/CN, coop déjà sync) retrouvée par email -> on pose le coop_id ;
//   3. n'existe pas -> on la crée (coop_id + email dans le contact).
// La coop n'assure PAS une synchro continue de main.personne : elle garantit juste son existence au
// moment où elle en a besoin (création d'une employeuse à l'inscription).
//
// ⚠️ Non branché dans le flux live : ce câblage fait partie du cutover coordonné avec l'Entrepôt
// (FK personne.coop_id posée par Flyway, grants INSERT/UPDATE sur main.personne au rôle `sonum`,
// arrêt de la branche emploi du coop-dag). Voir docs/adr/adr-002-reconciliation-dataspace.md.

// Retrouve une personne préexistante par email, sur TOUS les chemins où l'Entrepôt range un email :
// `contact.coop.email`, `contact.idposte.mail_perso`, `contact.idposte.mail_pro` (formes réelles
// vérifiées en base — la clé idposte est `mail_perso`/`mail_pro`, PAS `email`). Comparaison insensible
// à la casse des deux côtés (normalisation). En cas d'ambiguïté — un même email sur 2 personnes,
// ~0,3 % des cas — on préfère celle qui porte une affectation `idposte` active + structure, soit
// justement la ligne qu'on veut lire pour l'employeuse (tie-break : résout 5 des 6 collisions CN
// observées ; l'unique CN irréductible tombe alors sur la personne au plus petit id, déterministe).
// Les tables `main.*` sont qualifiées explicitement car le search_path (`coop,public`) n'inclut pas `main`.
const findPersonneByEmail = async (
  email: string,
  prisma: PrismaLike,
): Promise<{ id: number } | null> => {
  const normalise = email.trim().toLowerCase()
  if (normalise === '') return null

  const [personne] = await prisma.$queryRaw<{ id: number }[]>`
    SELECT p.id
    FROM main.personne p
    WHERE lower(p.contact->'coop'->>'email') = ${normalise}
       OR lower(p.contact->'idposte'->>'mail_perso') = ${normalise}
       OR lower(p.contact->'idposte'->>'mail_pro') = ${normalise}
    ORDER BY
      EXISTS (
        SELECT 1 FROM main.personne_affectations_emploi a
        WHERE a.personne_id = p.id
          AND a.source = 'idposte' AND a.est_active
          AND a.structure_administrative_id IS NOT NULL
      ) DESC,
      p.id ASC
    LIMIT 1`

  return personne ?? null
}

export const ensurePersonneMain = async (
  {
    coopUserId,
    email,
  }: {
    coopUserId: string
    email: string
  },
  prisma: PrismaLike = prismaClient,
): Promise<{ id: number }> => {
  const byCoopId = await prisma.personneMain.findFirst({
    where: { coopId: coopUserId },
    select: { id: true },
  })
  if (byCoopId) return byCoopId

  const byEmail = await findPersonneByEmail(email, prisma)
  if (byEmail) {
    return prisma.personneMain.update({
      where: { id: byEmail.id },
      data: { coopId: coopUserId },
      select: { id: true },
    })
  }

  return prisma.personneMain.create({
    data: {
      coopId: coopUserId,
      contact: { coop: { email } },
    },
    select: { id: true },
  })
}
