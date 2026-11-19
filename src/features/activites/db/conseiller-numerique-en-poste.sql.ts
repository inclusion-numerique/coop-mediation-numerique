import { Prisma } from '@/generated/prisma/client'

export const enPosteSql = (colonneUtilisateur: string, enPoste: boolean) =>
  Prisma.raw(
    `${enPoste ? '' : 'NOT '}EXISTS (SELECT 1 FROM main.conseiller_numerique_en_poste cn JOIN main.personne p ON p.id = cn.personne_id WHERE p.coop_id = ${colonneUtilisateur})`,
  )
