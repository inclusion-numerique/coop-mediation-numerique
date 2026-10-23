import type { AdresseCourriel } from '@app/web/features/utilisateurs/domain'
import {
  type BilanDeSynchronisation,
  contactsASynchroniser,
  type EchecDeLot,
  enLots,
  type IdentifiantDImport,
  type SynchroniserLesRolesBrevoPorts,
  type TailleDeLot,
} from '../domain'
import { inscritsDeLaListe } from '../implementation'

type Envois<R> = {
  readonly reussis: readonly R[]
  readonly faits: number
  readonly echecs: readonly (readonly AdresseCourriel[])[]
}

const envoyerParLots = <T, R>(
  elements: readonly T[],
  taille: TailleDeLot,
  envoyer: (lot: readonly T[]) => Promise<R>,
  courrielsDe: (element: T) => AdresseCourriel,
): Promise<Envois<R>> =>
  enLots(elements, taille).reduce<Promise<Envois<R>>>(
    async (precedent, lot) => {
      const envois = await precedent
      return envoyer(lot).then(
        (reussi) => ({
          ...envois,
          reussis: [...envois.reussis, reussi],
          faits: envois.faits + lot.length,
        }),
        () => ({ ...envois, echecs: [...envois.echecs, lot.map(courrielsDe)] }),
      )
    },
    Promise.resolve({ reussis: [], faits: 0, echecs: [] }),
  )

const echecs = (
  tag: EchecDeLot['_tag'],
  lots: readonly (readonly AdresseCourriel[])[],
): readonly EchecDeLot[] => lots.map((courriels) => ({ _tag: tag, courriels }))

export const synchroniserLesRolesBrevo = async (
  ports: SynchroniserLesRolesBrevoPorts,
): Promise<BilanDeSynchronisation> => {
  const { inscrits, illisibles } = await inscritsDeLaListe()
  const { aImporter, aRetirer } = contactsASynchroniser(inscrits)

  const imports = await envoyerParLots<
    (typeof aImporter)[number],
    IdentifiantDImport
  >(
    aImporter,
    ports.importer.tailleMax,
    ports.importer.envoyer,
    ({ courriel }) => courriel,
  )
  const retraits = await envoyerParLots(
    aRetirer,
    ports.retirer.tailleMax,
    ports.retirer.envoyer,
    (courriel) => courriel,
  )

  return {
    inscrits: inscrits.length,
    importes: imports.faits,
    retires: retraits.faits,
    illisibles,
    imports: imports.reussis,
    echecs: [
      ...echecs('ImportEchoue', imports.echecs),
      ...echecs('RetraitEchoue', retraits.echecs),
    ],
  }
}
