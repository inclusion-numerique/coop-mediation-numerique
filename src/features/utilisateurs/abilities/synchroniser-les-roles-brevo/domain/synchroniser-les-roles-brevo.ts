import type { AdresseCourriel } from '@/features/utilisateurs/domain'
import { type Result, success } from '@/libraries/result'
import type { ImporterUnLot, SynchroniserLesRolesBrevoPorts } from './ports'
import {
  type BilanDeSynchronisation,
  contactsASynchroniser,
  type EchecDeLot,
  type LotImporte,
} from './synchronisation'
import { enLots, type TailleDeLot } from './taille-de-lot'

type Envois<R> = {
  readonly reussis: readonly R[]
  readonly echecs: readonly (readonly AdresseCourriel[])[]
}

const envoyerParLots = <T, R>(
  lots: readonly (readonly T[])[],
  envoyer: (lot: readonly T[]) => Promise<Result<R, unknown>>,
  courrielsDe: (element: T) => AdresseCourriel,
): Promise<Envois<R>> =>
  lots.reduce<Promise<Envois<R>>>(
    async (precedent, lot) => {
      const envois = await precedent
      const envoi = await envoyer(lot)
      return envoi.success
        ? { ...envois, reussis: [...envois.reussis, envoi.data] }
        : { ...envois, echecs: [...envois.echecs, lot.map(courrielsDe)] }
    },
    Promise.resolve({ reussis: [], echecs: [] }),
  )

const echecs = (
  tag: EchecDeLot['_tag'],
  lots: readonly (readonly AdresseCourriel[])[],
): readonly EchecDeLot[] => lots.map((courriels) => ({ _tag: tag, courriels }))

const importerLeLot =
  (importerUnLot: ImporterUnLot) =>
  async (
    lot: Parameters<ImporterUnLot>[0],
  ): Promise<Result<LotImporte, unknown>> => {
    const envoi = await importerUnLot(lot)
    return envoi.success
      ? success({ contacts: lot, identifiant: envoi.data })
      : envoi
  }

export const synchroniserLesRolesBrevo =
  ({
    lireLesInscrits,
    importerUnLot,
    retirerUnLot,
  }: SynchroniserLesRolesBrevoPorts) =>
  async ({
    tailleDesImports,
    tailleDesRetraits,
  }: {
    readonly tailleDesImports: TailleDeLot
    readonly tailleDesRetraits: TailleDeLot
  }): Promise<Result<BilanDeSynchronisation, never>> => {
    const { inscrits, illisibles } = await lireLesInscrits()
    const { aImporter, aRetirer } = contactsASynchroniser(inscrits)

    const imports = await envoyerParLots(
      enLots(aImporter, tailleDesImports),
      importerLeLot(importerUnLot),
      ({ courriel }) => courriel,
    )
    const retraits = await envoyerParLots(
      enLots(aRetirer, tailleDesRetraits),
      async (lot) => {
        const envoi = await retirerUnLot(lot)
        return envoi.success ? success(lot) : envoi
      },
      (courriel) => courriel,
    )

    return success({
      inscrits: inscrits.length,
      illisibles,
      importes: imports.reussis,
      retires: retraits.reussis,
      echecs: [
        ...echecs('ImportEchoue', imports.echecs),
        ...echecs('RetraitEchoue', retraits.echecs),
      ],
    })
  }
