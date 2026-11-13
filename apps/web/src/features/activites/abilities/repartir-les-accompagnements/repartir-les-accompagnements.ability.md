# Feature: Répartir les accompagnements

> Les répartitions des statistiques : types d'activité, durées, types de
> lieu, thématiques et matériel. Chaque activité pèse le nombre de ses
> accompagnements.

## Rule: Chaque activité pèse le nombre de ses accompagnements

### Scenario: Un atelier de trois personnes pèse trois accompagnements

* Given la médiatrice "Ada Lovelace"
* And les activités de "Ada Lovelace" :
  | date       | type       | anonymes | duree | typeLieu  | thematiques                    | materiel             |
  | 2026-03-03 | individuel | 1        | 20    | Domicile  | Email                          | Ordinateur           |
  | 2026-03-05 | collectif  | 3        | 90    | ADistance | Email,ReseauxSociaux           | Telephone,Tablette   |
  | 2026-03-07 | individuel | 1        | 150   | ADistance | AideAuxDemarchesAdministratives | Aucun                |
* When je répartis les accompagnements de "Ada Lovelace"
* Then les accompagnements répartis sont 5
* And la répartition par type est "Individuel 2, Collectif 3"
* And la répartition par durée est "MoinsDe30Minutes 1, De30MinutesA1Heure 0, De1HeureA2Heures 3, DeuxHeuresEtPlus 1"
* And la répartition par type de lieu est "LieuActivite 0, Autre 0, Domicile 1, ADistance 4"
* And la thématique "Email" compte 4 accompagnements
* And la thématique "ReseauxSociaux" compte 3 accompagnements
* And la thématique "AideAuxDemarchesAdministratives" compte 1 accompagnements
* And la répartition par matériel est "Ordinateur 1, Telephone 3, Tablette 3, Autre 0, Aucun 1"

## Rule: Seules les activités vivantes du périmètre sont réparties

### Scenario: Une activité supprimée n'est pas répartie

* Given la médiatrice "Ada Lovelace"
* And les activités de "Ada Lovelace" :
  | date       | type       | supprimee |
  | 2026-03-03 | individuel |           |
  | 2026-03-05 | collectif  | oui       |
* When je répartis les accompagnements de "Ada Lovelace"
* Then la répartition par type est "Individuel 1, Collectif 0"
