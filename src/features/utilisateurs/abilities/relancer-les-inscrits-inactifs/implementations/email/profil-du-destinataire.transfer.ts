import type { ProfilDuDestinataire } from '@/features/utilisateurs/domain'

type ProfilDuCourriel = {
  readonly isMediateur: boolean
  readonly isCoordinateur: boolean
}

const PROFILS_DU_COURRIEL: Readonly<
  Record<ProfilDuDestinataire['_tag'], ProfilDuCourriel>
> = {
  SansRole: { isMediateur: false, isCoordinateur: false },
  Mediateur: { isMediateur: true, isCoordinateur: false },
  Coordinateur: { isMediateur: false, isCoordinateur: true },
  MediateurEtCoordinateur: { isMediateur: true, isCoordinateur: true },
}

export const profilDuCourriel = (
  profil: ProfilDuDestinataire,
): ProfilDuCourriel => PROFILS_DU_COURRIEL[profil._tag]
