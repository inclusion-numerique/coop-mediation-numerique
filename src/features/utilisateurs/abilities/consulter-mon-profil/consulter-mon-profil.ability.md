# Feature: Consulter mon profil

> La page « Mon profil » rappelle l'identité de la personne, telle que
> ProConnect la fournit, puis ne montre que les cartes qui la concernent : son
> contrat, l'activation de la médiation numérique, la suppression de son
> compte.

## Rule: Les cartes affichées dépendent du rôle de la personne

> Le contrat n'existe que pour un coordinateur ou un conseiller numérique ;
> seul un coordinateur peut activer la médiation numérique pour lui-même ; un
> conseiller numérique ne supprime pas son compte, qui dépend du dispositif.

### Scenario Outline: Un « <personne> » voit les cartes qui le concernent

* Given une personne qui consulte son profil en tant que "<personne>"
* When son profil est présenté
* Then la carte du contrat est "<contrat>"
* And la carte de la médiation numérique est "<mediation>"
* And la carte de suppression du compte est "<suppression>"

#### Examples:

  | personne                          | contrat  | mediation | suppression |
  | --------------------------------- | -------- | --------- | ----------- |
  | médiateur hors dispositif         | masquée  | masquée   | affichée    |
  | conseiller numérique              | affichée | masquée   | masquée     |
  | coordinateur                      | affichée | affichée  | affichée    |
  | coordinateur conseiller numérique | affichée | affichée  | masquée     |

## Rule: Le téléphone s'affiche au format national, et seulement s'il est connu

### Scenario: Un téléphone connu est affiché au format national

* Given une personne qui consulte son profil avec le téléphone "+33612345678"
* When son profil est présenté
* Then le téléphone affiché est "06 12 34 56 78"

### Scenario: Sans téléphone connu, aucun n'est affiché

* Given une personne qui consulte son profil sans téléphone connu
* When son profil est présenté
* Then aucun téléphone n'est affiché
