import type { Siret } from '@/libraries/insee'
import { type Result, success } from '@/libraries/result'
import type {
  RechercherUneStructureEmployeusePorts,
  StructuresLues,
} from './ports'
import type { StructuresTrouvees } from './structures-trouvees'

const LONGUEUR_MINIMALE = 3

const LIMITE_DE_LA_COOP = 25

const PLAFOND = 50

const AUCUNE_LECTURE: StructuresLues<never> = { structures: [], total: 0 }

const nonLues = (lues: StructuresLues<unknown>): number =>
  Math.max(lues.total - lues.structures.length, 0)

const premiereParSiret = <Structure extends { readonly siret: Siret }>(
  structure: Structure,
  index: number,
  structures: readonly Structure[],
): boolean =>
  structures.findIndex(({ siret }) => siret === structure.siret) === index

export const rechercherUneStructureEmployeuse =
  <
    Coop extends { readonly siret: Siret },
    Annuaire extends { readonly siret: Siret },
  >({
    lireLesStructuresDeLaCoop,
    lireLAnnuaireDesEntreprises,
  }: RechercherUneStructureEmployeusePorts<Coop, Annuaire>) =>
  async ({
    recherche,
  }: {
    readonly recherche: string
  }): Promise<Result<StructuresTrouvees<Coop | Annuaire>, never>> => {
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
    const coop = delaCoop.structures.filter(premiereParSiret)
    const siretsDeLaCoop = coop.map(({ siret }) => siret)
    const trouvees: readonly (Coop | Annuaire)[] = [
      ...coop,
      ...annuaire.structures.filter(
        ({ siret }) => !siretsDeLaCoop.includes(siret),
      ),
    ]

    return success({
      structures: trouvees.slice(0, PLAFOND),
      totalCount: trouvees.length,
      moreResults: nonLues(delaCoop) + nonLues(annuaire),
      apiUnavailable: !delAnnuaire.success,
    })
  }
