const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000

const INSCRIPTION_STATUTS = [
  { days: 7, label: 'Inscription en cours J+7' },
  { days: 30, label: 'Inscription en cours J+30' },
  { days: 60, label: 'Inscription en cours J+60' },
  { days: 90, label: 'Inscription en cours J+90' },
]

const NOUVEAU_STATUTS = [
  { days: 7, label: 'Nouveau J+7' },
  { days: 30, label: 'Nouveau J+30' },
  { days: 60, label: 'Nouveau J+60' },
  { days: 90, label: 'Nouveau J+90' },
]

const INACTIVITE_STATUTS = [
  { days: 30, label: 'Inactif J+30' },
  { days: 90, label: 'Inactif J+90' },
  { days: 180, label: 'Inactif J+180' },
]

const toStatutFromDateDiff =
  (diff: number) =>
  (
    statutCompteInscription: string,
    { days, label }: { days: number; label: string },
  ) =>
    diff >= days * MILLISECONDS_IN_A_DAY ? label : statutCompteInscription

export const statutCompte =
  (now: Date) =>
  ({
    lastLogin,
    created,
    inscriptionValidee,
    mediateur,
    coordinateur,
  }: {
    created: Date
    lastLogin: Date | null
    inscriptionValidee: Date | null
    mediateur: { derniereCreationActivite: Date | null } | null
    coordinateur: {
      derniereCreationActivite: Date | null
      _count: { mediateursCoordonnes: number }
    } | null
  }) => {
    if (inscriptionValidee == null) {
      const createdDiff = now.getTime() - created.getTime()
      return INSCRIPTION_STATUTS.reduce(
        toStatutFromDateDiff(createdDiff),
        'Inscription en cours',
      )
    }

    if (
      lastLogin != null &&
      ((coordinateur?._count.mediateursCoordonnes ?? 0) > 0 ||
        coordinateur?.derniereCreationActivite != null)
    ) {
      const lastLoginDiff = now.getTime() - lastLogin.getTime()
      return INACTIVITE_STATUTS.reduce(
        toStatutFromDateDiff(lastLoginDiff),
        'Actif',
      )
    }

    if (mediateur?.derniereCreationActivite != null) {
      const lastActivityDiff =
        now.getTime() - mediateur.derniereCreationActivite.getTime()
      return INACTIVITE_STATUTS.reduce(
        toStatutFromDateDiff(lastActivityDiff),
        'Actif',
      )
    }

    const validatedDiff = now.getTime() - inscriptionValidee.getTime()
    return NOUVEAU_STATUTS.reduce(
      toStatutFromDateDiff(validatedDiff),
      'Nouveau',
    )
  }
