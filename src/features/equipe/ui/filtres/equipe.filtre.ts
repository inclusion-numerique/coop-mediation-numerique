import { Sort } from '@arckit/resultset'
import {
  type ColonneDeLEquipe,
  type CriteresEquipe,
  FiltreRole,
  FiltreStatut,
} from '@/features/equipe/domain'
import {
  composerLEtat,
  filtreDeChoix,
  filtreDeChoixUnique,
  rechercheLibre,
  triParmi,
} from '@/libraries/etat-d-url'

export const filtreDuStatutDuMembre = filtreDeChoix({
  titre: 'Statut',
  cle: 'statut',
  choix: {
    actifs: 'Actifs',
    inactifs: 'Inactifs',
    invitations: 'Invitations envoyées',
    archives: 'Archivés',
  },
})

export const filtreDuRoleDuMembre = filtreDeChoixUnique({
  titre: 'Rôle',
  cle: 'role',
  choix: {
    'conseiller-numerique': 'Conseillers numériques',
    'mediateur-numerique': 'Médiateurs numériques',
  },
})

export const filtresDeLEquipe = composerLEtat(
  rechercheLibre,
  filtreDuStatutDuMembre,
  filtreDuRoleDuMembre,
)

export const triDeLEquipe = triParmi({
  colonnes: [
    'membre',
    'structureEmployeuse',
    'statut',
  ] satisfies readonly ColonneDeLEquipe[],
  parDefaut: Sort('statut', 'asc'),
})

const triDesMembres = composerLEtat(triDeLEquipe)

export const criteresDeLEquipe = (
  parametres: Parameters<typeof filtresDeLEquipe.charger>[0],
): CriteresEquipe => {
  const { recherche, statut, role } = filtresDeLEquipe.charger(parametres)
  return {
    recherche,
    statuts: statut.map((valeur) => FiltreStatut(valeur)),
    role: role === null ? null : FiltreRole(role),
    tri: triDesMembres.charger(parametres).tri,
  }
}

export const requeteDeLExport = (
  parametres: Parameters<typeof filtresDeLEquipe.charger>[0],
): string =>
  [
    filtresDeLEquipe.requete(filtresDeLEquipe.charger(parametres)),
    triDesMembres.requete(triDesMembres.charger(parametres)),
  ]
    .filter((requete) => requete !== '')
    .join('&')
