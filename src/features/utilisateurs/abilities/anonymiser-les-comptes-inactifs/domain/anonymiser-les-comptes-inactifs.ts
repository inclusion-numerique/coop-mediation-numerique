import type { UtilisateurId } from '@/features/utilisateurs/domain'
import { type Result, success } from '@/libraries/result'
import { type CompteAExaminer, derniereActivite } from './compte-a-examiner'
import { type EtapeInactivite, etapeInactivite } from './etape-inactivite'
import type { AnonymiserLesComptesInactifsPorts } from './ports'

export type CompteExamine = {
  readonly utilisateurId: UtilisateurId
  readonly etape: EtapeInactivite
} & (
  | { readonly issue: 'simule' | 'fait' }
  | { readonly issue: 'echec'; readonly cause: string }
)

type Issue =
  | { readonly issue: 'fait' }
  | { readonly issue: 'echec'; readonly cause: string }

const FAIT: Issue = { issue: 'fait' }

const avertir = async (
  compte: CompteAExaminer,
  dateDeSuppression: Date,
  maintenant: Date,
  {
    avertirDeLaSuppression,
    noterLAvertissement,
  }: AnonymiserLesComptesInactifsPorts,
): Promise<Issue> => {
  const avertissement = await avertirDeLaSuppression({
    courriel: compte.courriel,
    prenom: compte.prenom,
    dateDeSuppression,
  })
  if (!avertissement.success)
    return { issue: 'echec', cause: avertissement.error.cause }

  const note = await noterLAvertissement(compte.id, maintenant)
  return note.success ? FAIT : { issue: 'echec', cause: note.error.cause }
}

const supprimer = async (
  compte: CompteAExaminer,
  maintenant: Date,
  { supprimerLeCompte }: AnonymiserLesComptesInactifsPorts,
): Promise<Issue> => {
  const suppression = await supprimerLeCompte({
    utilisateurId: compte.id,
    maintenant,
  })
  return suppression.success
    ? FAIT
    : { issue: 'echec', cause: suppression.error.motif }
}

const agir = (
  compte: CompteAExaminer,
  etape: EtapeInactivite,
  maintenant: Date,
  ports: AnonymiserLesComptesInactifsPorts,
): Promise<Issue> => {
  if (etape._tag === 'aAvertir')
    return avertir(compte, etape.dateDeSuppression, maintenant, ports)
  if (etape._tag === 'aSupprimer') return supprimer(compte, maintenant, ports)
  return Promise.resolve(FAIT)
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

    if (simuler) return { utilisateurId: compte.id, etape, issue: 'simule' }

    return {
      utilisateurId: compte.id,
      etape,
      ...(await agir(compte, etape, maintenant, ports)),
    }
  }

export const anonymiserLesComptesInactifs =
  ({
    lireLesComptesAExaminer,
    avertirDeLaSuppression,
    noterLAvertissement,
    supprimerLeCompte,
  }: AnonymiserLesComptesInactifsPorts) =>
  async ({
    maintenant,
    simuler,
  }: {
    readonly maintenant: Date
    readonly simuler: boolean
  }): Promise<Result<readonly CompteExamine[], never>> => {
    const comptes = await lireLesComptesAExaminer(maintenant)
    const examinerLeCompte = examiner(maintenant, simuler, {
      lireLesComptesAExaminer,
      avertirDeLaSuppression,
      noterLAvertissement,
      supprimerLeCompte,
    })

    return success(
      await comptes.reduce<Promise<readonly CompteExamine[]>>(
        async (precedents, compte) => [
          ...(await precedents),
          await examinerLeCompte(compte),
        ],
        Promise.resolve([]),
      ),
    )
  }
