# Fonctionnalité: Répartir les accompagnements

> Les répartitions des statistiques : types d'activité, durées, types de
> lieu, thématiques et matériel. Chaque activité pèse le nombre de ses
> accompagnements.

## Règle: Chaque activité pèse le nombre de ses accompagnements

### Scénario: Un atelier de trois personnes pèse trois accompagnements

* Étant donné la médiatrice "Ada Lovelace"
* Et les activités de "Ada Lovelace" :
  | date       | type       | anonymes | duree | typeLieu  | thematiques                    | materiel             |
  | 2026-03-03 | individuel | 1        | 20    | Domicile  | Email                          | Ordinateur           |
  | 2026-03-05 | collectif  | 3        | 90    | ADistance | Email,ReseauxSociaux           | Telephone,Tablette   |
  | 2026-03-07 | individuel | 1        | 150   | ADistance | AideAuxDemarchesAdministratives | Aucun                |
* Quand je répartis les accompagnements de "Ada Lovelace"
* Alors les accompagnements répartis sont 5
* Et la répartition par type est "Individuel 2, Collectif 3"
* Et la répartition par durée est "MoinsDe30Minutes 1, De30MinutesA1Heure 0, De1HeureA2Heures 3, DeuxHeuresEtPlus 1"
* Et la répartition par type de lieu est "LieuActivite 0, Autre 0, Domicile 1, ADistance 4"
* Et la thématique "Email" compte 4 accompagnements
* Et la thématique "ReseauxSociaux" compte 3 accompagnements
* Et la thématique "AideAuxDemarchesAdministratives" compte 1 accompagnements
* Et la répartition par matériel est "Ordinateur 1, Telephone 3, Tablette 3, Autre 0, Aucun 1"

## Règle: Seules les activités vivantes du périmètre sont réparties

### Scénario: Une activité supprimée n'est pas répartie

* Étant donné la médiatrice "Ada Lovelace"
* Et les activités de "Ada Lovelace" :
  | date       | type       | supprimee |
  | 2026-03-03 | individuel |           |
  | 2026-03-05 | collectif  | oui       |
* Quand je répartis les accompagnements de "Ada Lovelace"
* Alors la répartition par type est "Individuel 1, Collectif 0"
