import type { UtilisateurId } from '@app/web/features/utilisateurs/domain'
import {
  type AnonymiserLesComptesInactifsPorts,
  type CompteAExaminer,
  derniereActivite,
  type EtapeInactivite,
  etapeInactivite,
} from '../domain'
import { lireLesComptesAExaminer, noterLAvertissement } from '../implementation'

export type CompteExamine = {
  readonly utilisateurId: UtilisateurId
  readonly etape: EtapeInactivite['_tag']
} & (
  | { readonly issue: 'simule' | 'fait' }
  | { readonly issue: 'echec'; readonly cause: string }
)

const agir = async (
  compte: CompteAExaminer,
  etape: EtapeInactivite,
  maintenant: Date,
  ports: AnonymiserLesComptesInactifsPorts,
): Promise<void> => {
  if (etape._tag === 'aAvertir') {
    await ports.avertirDeLaSuppression({
      courriel: compte.courriel,
      prenom: compte.prenom,
      dateDeSuppression: etape.dateDeSuppression,
    })
    await noterLAvertissement(compte.id, maintenant)
    return
  }

  if (etape._tag === 'aSupprimer') {
    await ports.supprimerLeCompte(compte.id)
  }
}

const examiner =
  (
    maintenant: Date,
    simuler: boolean,
    ports: AnonymiserLesComptesInactifsPorts,
  ) =>
  async (compte: CompteAExaminer): Promise<CompteExamine> => {
    const etape = etapeInactivite({
      derniereActivite: derniereActivite(compte),
      avertiLe: compte.avertiLe,
      maintenant,
    })

    if (simuler) {
      return { utilisateurId: compte.id, etape: etape._tag, issue: 'simule' }
    }

    return agir(compte, etape, maintenant, ports).then(
      (): CompteExamine => ({
        utilisateurId: compte.id,
        etape: etape._tag,
        issue: 'fait',
      }),
      (erreur: unknown): CompteExamine => ({
        utilisateurId: compte.id,
        etape: etape._tag,
        issue: 'echec',
        cause: erreur instanceof Error ? erreur.message : String(erreur),
      }),
    )
  }

export const anonymiserLesComptesInactifs = async ({
  maintenant,
  simuler,
  ports,
}: {
  readonly maintenant: Date
  readonly simuler: boolean
  readonly ports: AnonymiserLesComptesInactifsPorts
}): Promise<readonly CompteExamine[]> => {
  const comptes = await lireLesComptesAExaminer(maintenant)

  return comptes.reduce<Promise<readonly CompteExamine[]>>(
    async (precedents, compte) => [
      ...(await precedents),
      await examiner(maintenant, simuler, ports)(compte),
    ],
    Promise.resolve([]),
  )
}
