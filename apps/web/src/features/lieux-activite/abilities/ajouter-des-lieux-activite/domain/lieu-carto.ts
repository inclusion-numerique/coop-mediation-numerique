import { v4 } from 'uuid'
import type { Fiche } from '../../../domain/fiche'
import type { IdsCartographieNationale } from '../../../domain/ids-cartographie-nationale'
import type { Lieu } from '../../../domain/lieu'
import { LieuId } from '../../../domain/lieu-id'
import {
  ModificationInconnue,
  ModifieParSource,
  type SourceCartographie,
} from '../../../domain/tracabilite'
import { VisibiliteCartographie } from '../../../domain/visibilite-cartographie'

/**
 * Un lieu tel que la cartographie nationale le décrit : sa fiche, et les deux
 * choses que l'enveloppe coop en tire — sous quels identifiants la carto le
 * connaît, et quel producteur l'a écrit en dernier.
 *
 * Ni adresse ni localisation : elles vivent dans la fiche, où la cartographie
 * les laisse nulles. Elle ne porte pas d'identifiant BAN, donc rien n'y
 * distingue une adresse reconnue d'une adresse saisie à l'estime, et c'est
 * celle de l'écran qui fait foi.
 */
export type LieuCarto = {
  readonly idsCartographieNationale: IdsCartographieNationale
  readonly source: SourceCartographie | null
  readonly fiche: Fiche
}

/**
 * La dernière écriture qu'on peut attribuer.
 *
 * Un producteur tiers nommé signe la fiche. La coop relisant sa propre
 * publication n'en nomme aucun : la modification reste alors sans auteur — la
 * variante ordinaire, 9 825 lieux sur 12 750 en base.
 */
const derniereModification = (
  source: SourceCartographie | null,
  maintenant: Date,
) =>
  source == null
    ? ModificationInconnue(maintenant)
    : ModifieParSource(maintenant, source)

/**
 * Le lieu que la coop matérialise depuis la cartographie.
 *
 * Pendant de `nouveauLieu`, qui fait le même travail depuis un formulaire :
 * dans les deux cas la fiche devient un lieu du domaine, et c'est le transfer
 * qui en tire des colonnes. L'adresse manque, et l'appelant la complète avec
 * celle que la Base Adresse Nationale a validée.
 */
export const lieuDepuisCarto = (
  { idsCartographieNationale, source, fiche }: LieuCarto,
  maintenant: Date,
): Lieu => ({
  id: LieuId(v4()),
  fiche,
  visibilite: VisibiliteCartographie('Publie'),
  idsCartographieNationale,
  banId: null,
  identiteSirene: { nomUsage: null, synchronisation: null },
  tracabilite: {
    // Sans auteur, comme l'autre chemin de matérialisation : la colonne n'a
    // jamais été renseignée pour un lieu ajouté à une activité, et la remplir
    // ici seulement ferait diverger les deux branches.
    creation: { date: maintenant, par: null },
    derniereModification: derniereModification(source, maintenant),
    suppression: { _tag: 'Actif' },
  },
})
