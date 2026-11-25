# Fonctionnalité: Consulter mon profil

> La page « Mon profil » rappelle l'identité de la personne, telle que
> ProConnect la fournit, puis ne montre que les cartes qui la concernent : son
> contrat, l'activation de la médiation numérique, la suppression de son
> compte.

## Règle: Les cartes affichées dépendent du rôle de la personne

> Le contrat n'existe que pour un coordinateur ou un conseiller numérique ;
> seul un coordinateur peut activer la médiation numérique pour lui-même ; un
> conseiller numérique ne supprime pas son compte, qui dépend du dispositif.

### Plan du scénario: Un « <personne> » voit les cartes qui le concernent

* Étant donné une personne qui consulte son profil en tant que "<personne>"
* Quand son profil est présenté
* Alors la carte du contrat est "<contrat>"
* Et la carte de la médiation numérique est "<mediation>"
* Et la carte de suppression du compte est "<suppression>"

#### Exemples:

  | personne                          | contrat  | mediation | suppression |
  | --------------------------------- | -------- | --------- | ----------- |
  | médiateur hors dispositif         | masquée  | masquée   | affichée    |
  | conseiller numérique              | affichée | masquée   | masquée     |
  | coordinateur                      | affichée | affichée  | affichée    |
  | coordinateur conseiller numérique | affichée | affichée  | masquée     |

## Règle: Le téléphone s'affiche au format national, et seulement s'il est connu

### Scénario: Un téléphone connu est affiché au format national

* Étant donné une personne qui consulte son profil avec le téléphone "+33612345678"
* Quand son profil est présenté
* Alors le téléphone affiché est "06 12 34 56 78"

### Scénario: Sans téléphone connu, aucun n'est affiché

* Étant donné une personne qui consulte son profil sans téléphone connu
* Quand son profil est présenté
* Alors aucun téléphone n'est affiché
