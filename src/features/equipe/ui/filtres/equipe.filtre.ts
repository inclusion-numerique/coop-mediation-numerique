import type { z } from 'zod'
import {
  type CriteresEquipe,
  FiltreRole,
  FiltreStatut,
  OrdreDeTri,
  RechercheDansLEquipe,
  TriEquipe,
} from '@/features/equipe/domain'
import { composerLesFiltres } from '@/libraries/filtres/definition/composition'
import {
  filtreDeChoix,
  filtreDeChoixUnique,
} from '@/libraries/filtres/definition/filtre-de-choix'

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

export const filtresDeLEquipe = composerLesFiltres(
  filtreDuStatutDuMembre,
  filtreDuRoleDuMembre,
)

type ParametresDeLaListe = Readonly<
  Record<string, string | readonly string[] | undefined>
>

const premiere = (valeur: string | readonly string[] | undefined) =>
  typeof valeur === 'string' ? valeur : valeur?.at(0)

const lue = <S extends z.ZodType>(
  schema: S,
  valeur: string | readonly string[] | undefined,
): z.output<S> | null => {
  const resultat = schema.safeParse(premiere(valeur))
  return resultat.success ? resultat.data : null
}

export const criteresDeLEquipe = (
  parametres: ParametresDeLaListe,
): CriteresEquipe => {
  const { statut, role } = filtresDeLEquipe.charger(parametres)
  return {
    recherche: lue(RechercheDansLEquipe.schema, parametres.recherche),
    statuts: statut.map((valeur) => FiltreStatut(valeur)),
    role: role === null ? null : FiltreRole(role),
    tri: lue(TriEquipe.schema, parametres.tri) ?? TriEquipe('statut'),
    ordre: lue(OrdreDeTri.schema, parametres.ordre) ?? OrdreDeTri('asc'),
  }
}
