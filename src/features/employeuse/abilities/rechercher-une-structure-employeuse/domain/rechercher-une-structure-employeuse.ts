import type { Siret } from '@/libraries/insee'
import { type Result, success } from '@/libraries/result'
import type { Employeuse } from '../../../domain/employeuse'
import type {
  RechercherUneStructureEmployeusePorts,
  StructuresLues,
} from './ports'
import type {
  EmployeuseAvecSiret,
  StructuresTrouvees,
  StructureTrouvee,
} from './structures-trouvees'

const LONGUEUR_MINIMALE = 3

const LIMITE_DE_LA_COOP = 25

const PLAFOND = 50

const AUCUNE_LECTURE: StructuresLues<never> = { structures: [], total: 0 }

const nonLues = (lues: {
  readonly total: number
  readonly lues: number
}): number => Math.max(lues.total - lues.lues, 0)

const aUnSiret = (employeuse: Employeuse): employeuse is EmployeuseAvecSiret =>
  employeuse.siret !== null

const premiereParSiret = <Structure extends { readonly siret: Siret }>(
  structure: Structure,
  index: number,
  structures: readonly Structure[],
): boolean =>
  structures.findIndex(({ siret }) => siret === structure.siret) === index

const deLaCoop = (
  employeuse: EmployeuseAvecSiret,
): StructureTrouvee<never> => ({
  _tag: 'DeLaCoop',
  employeuse,
})

const deLAnnuaire = <Etablissement>(
  etablissement: Etablissement,
): StructureTrouvee<Etablissement> => ({ _tag: 'DeLAnnuaire', etablissement })

export const rechercherUneStructureEmployeuse =
  <Etablissement extends { readonly siret: Siret }>({
    lireLesStructuresDeLaCoop,
    lireLAnnuaireDesEntreprises,
  }: RechercherUneStructureEmployeusePorts<Etablissement>) =>
  async ({
    recherche,
  }: {
    readonly recherche: string
  }): Promise<Result<StructuresTrouvees<Etablissement>, never>> => {
    if (recherche.length < LONGUEUR_MINIMALE)
      return success({
        structures: [],
        totalCount: 0,
        moreResults: 0,
        apiUnavailable: false,
      })

    const [delaCoop, delAnnuaire] = await Promise.all([
      lireLesStructuresDeLaCoop({ recherche, limite: LIMITE_DE_LA_COOP }),
      lireLAnnuaireDesEntreprises(recherche),
    ])

    const annuaire = delAnnuaire.success ? delAnnuaire.data : AUCUNE_LECTURE
    const avecSiret = delaCoop.employeuses.filter(aUnSiret)
    const coop = avecSiret.filter(premiereParSiret)
    const siretsDeLaCoop = coop.map(({ siret }) => siret)
    const trouvees: readonly StructureTrouvee<Etablissement>[] = [
      ...coop.map(deLaCoop),
      ...annuaire.structures
        .filter(({ siret }) => !siretsDeLaCoop.includes(siret))
        .map(deLAnnuaire),
    ]

    return success({
      structures: trouvees.slice(0, PLAFOND),
      totalCount: trouvees.length,
      moreResults:
        nonLues({ total: delaCoop.total, lues: avecSiret.length }) +
        nonLues({ total: annuaire.total, lues: annuaire.structures.length }),
      apiUnavailable: !delAnnuaire.success,
    })
  }
