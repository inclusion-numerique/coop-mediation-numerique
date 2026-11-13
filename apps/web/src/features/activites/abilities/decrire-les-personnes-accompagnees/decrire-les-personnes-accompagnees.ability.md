# Feature: Décrire les personnes accompagnées

> Le profil des personnes accompagnées dans le périmètre : genre, tranche
> d'âge et statut social. Chaque personne compte une fois, quel que soit le
> nombre de ses accompagnements.

## Rule: Chaque personne compte une fois, une donnée absente est non communiquée

### Scenario: Trois personnes dont une sans genre

* Given la médiatrice "Ada Lovelace"
* And les activités de "Ada Lovelace" :
  | date       | type       | anonymes | genre    | trancheAge          | statutSocial |
  | 2026-03-03 | collectif  | 2        | Feminin  | VingtCinqTrenteNeuf | EnEmploi     |
  | 2026-03-05 | individuel | 1        |          |                     | Retraite     |
* When je décris les personnes accompagnées par "Ada Lovelace"
* Then les personnes décrites sont 3
* And la répartition par genre est "Masculin 0, Feminin 2, NonCommunique 1"
* And la répartition par statut social est "Scolarise 0, SansEmploi 0, EnEmploi 2, Retraite 1, NonCommunique 0"

## Rule: La tranche d'âge se déduit de l'année de naissance quand elle est connue

### Scenario: L'année de naissance l'emporte sur la tranche saisie

* Given la médiatrice "Ada Lovelace"
* And les activités de "Ada Lovelace" :
  | date       | type       | anonymes | trancheAge   | anneeNaissance |
  | 2026-03-03 | individuel | 1        | MoinsDeDouze | 1950           |
  | 2026-03-05 | individuel | 1        | DouzeDixHuit |                |
  | 2026-03-07 | individuel | 1        |              | 1850           |
* When je décris les personnes accompagnées par "Ada Lovelace"
* Then la tranche "SoixanteDixPlus" compte 1 personne
* And la tranche "DouzeDixHuit" compte 1 personne
* And la tranche "NonCommunique" compte 1 personne
