# Fonctionnalité: Décrire les personnes accompagnées

> Le profil des personnes accompagnées dans le périmètre : genre, tranche
> d'âge et statut social. Chaque personne compte une fois, quel que soit le
> nombre de ses accompagnements.

## Règle: Chaque personne compte une fois, une donnée absente est non communiquée

### Scénario: Trois personnes dont une sans genre

* Étant donné la médiatrice "Ada Lovelace"
* Et les activités de "Ada Lovelace" :
  | date       | type       | anonymes | genre    | trancheAge          | statutSocial |
  | 2026-03-03 | collectif  | 2        | Feminin  | VingtCinqTrenteNeuf | EnEmploi     |
  | 2026-03-05 | individuel | 1        |          |                     | Retraite     |
* Quand je décris les personnes accompagnées par "Ada Lovelace"
* Alors les personnes décrites sont 3
* Et la répartition par genre est "Masculin 0, Feminin 2, NonCommunique 1"
* Et la répartition par statut social est "Scolarise 0, SansEmploi 0, EnEmploi 2, Retraite 1, NonCommunique 0"

## Règle: La tranche d'âge se déduit de l'année de naissance quand elle est connue

### Scénario: L'année de naissance l'emporte sur la tranche saisie

* Étant donné la médiatrice "Ada Lovelace"
* Et les activités de "Ada Lovelace" :
  | date       | type       | anonymes | trancheAge   | anneeNaissance |
  | 2026-03-03 | individuel | 1        | MoinsDeDouze | 1950           |
  | 2026-03-05 | individuel | 1        | DouzeDixHuit |                |
  | 2026-03-07 | individuel | 1        |              | 1850           |
* Quand je décris les personnes accompagnées par "Ada Lovelace"
* Alors la tranche "SoixanteDixPlus" compte 1 personne
* Et la tranche "DouzeDixHuit" compte 1 personne
* Et la tranche "NonCommunique" compte 1 personne
