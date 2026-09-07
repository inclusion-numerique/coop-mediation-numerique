import { coopCartographieNationaleSource } from '@app/web/libraries/cartographie-nationale'
import { Contact, Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { v4 } from 'uuid'
import type { Fiche } from '../../../domain/fiche'
import { IdsCartographieNationale } from '../../../domain/ids-cartographie-nationale'
import type { Lieu } from '../../../domain/lieu'
import { LieuId } from '../../../domain/lieu-id'
import {
  courrielsValides,
  presentationSaisie,
  sitesWebSaisis,
  telephoneValide,
  urlSaisie,
} from '../../../domain/saisie'
import {
  ModificationInconnue,
  ModifieParSource,
  SourceCartographie,
} from '../../../domain/tracabilite'
import { VisibiliteCartographie } from '../../../domain/visibilite-cartographie'
import type { CartoStructure } from './carto-structure'

const contactDeLaCarto = (carto: CartoStructure): Contact => {
  const telephone = telephoneValide(carto.telephone)
  const courriels = courrielsValides(carto.courriels)
  const sitesWeb = sitesWebSaisis(carto.siteWeb)

  return Contact({
    ...(telephone == null ? {} : { telephone }),
    ...(courriels.length === 0 ? {} : { courriels: [...courriels] }),
    ...(sitesWeb.length === 0 ? {} : { site_web: [...sitesWeb] }),
  })
}

/**
 * Ce que la cartographie sait dire de la fiche, et rien de plus : ni adresse ni
 * localisation, que l'appelant tient de la Base Adresse Nationale, ni pivot,
 * dont la cartographie n'est pas une source fiable.
 *
 * Les listes qu'elle ne porte pas — dispositifs, labels de formation — restent
 * vides plutôt que d'être devinées.
 */
const ficheDepuisCarto = (carto: CartoStructure): Fiche => ({
  nom: Nom(carto.nom),
  pivot: null,
  adresse: null,
  localisation: null,
  typologies: carto.typologies,
  contact: contactDeLaCarto(carto),
  horaires: carto.horaires,
  presentation: presentationSaisie(
    carto.presentationResume,
    carto.presentationDetail,
  ),
  services: carto.services,
  publicsSpecifiquementAdresses: carto.publicsSpecifiquementAdresses,
  priseEnChargeSpecifique: carto.priseEnChargeSpecifique,
  modalitesAcces: carto.modalitesAcces,
  fraisACharge: carto.fraisACharge,
  itinerance: carto.itinerance,
  dispositifProgrammesNationaux: [],
  formationsLabels: [],
  autresFormationsLabels: [],
  modalitesAccompagnement: carto.modalitesAccompagnement,
  ficheAccesLibre: urlSaisie(carto.ficheAccesLibre),
  priseRdv: null,
})

/**
 * La dernière écriture qu'on peut attribuer.
 *
 * Un producteur tiers nommé signe la fiche. La coop relisant sa propre
 * publication ne signe rien, et une source vide ne dit rien non plus : la
 * modification reste alors sans auteur — la variante ordinaire, 9 825 lieux sur
 * 12 750 en base.
 */
const derniereModification = (source: string | null, maintenant: Date) => {
  const producteur =
    source == null || source === coopCartographieNationaleSource
      ? null
      : SourceCartographie.safe(source)

  return producteur == null
    ? ModificationInconnue(maintenant)
    : ModifieParSource(maintenant, producteur)
}

/**
 * Le lieu que la coop matérialise depuis une structure de la cartographie.
 *
 * Pendant de `nouveauLieu`, qui fait le même travail depuis un formulaire :
 * dans les deux cas la fiche devient un lieu du domaine, et c'est le transfer
 * qui en tire des colonnes. L'adresse manque ici et l'appelant la complète —
 * la cartographie ne porte pas d'identifiant BAN, donc rien n'y distingue une
 * adresse reconnue d'une adresse saisie à l'estime.
 */
export const lieuDepuisCarto = (
  carto: CartoStructure,
  maintenant: Date,
): Lieu => ({
  id: LieuId(v4()),
  fiche: ficheDepuisCarto(carto),
  visibilite: VisibiliteCartographie('Publie'),
  idsCartographieNationale: IdsCartographieNationale.safe(carto.id),
  banId: null,
  identiteSirene: { nomUsage: null, synchronisation: null },
  tracabilite: {
    // Sans auteur, comme l'autre chemin de matérialisation : la colonne n'a
    // jamais été renseignée pour un lieu ajouté à une activité, et la remplir
    // ici seulement ferait diverger les deux branches.
    creation: { date: maintenant, par: null },
    derniereModification: derniereModification(carto.source, maintenant),
    suppression: { _tag: 'Actif' },
  },
})
