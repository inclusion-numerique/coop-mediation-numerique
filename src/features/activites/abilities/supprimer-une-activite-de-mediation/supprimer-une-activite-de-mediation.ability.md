# Fonctionnalité: Supprimer une activité de médiation

## Règle: Le médiateur supprime ses propres activités

> La suppression est douce : l'activité quitte l'historique mais reste en
> base, détachée de ses accompagnements, de ses tags et de son rendez-vous.
> Les compteurs du médiateur, du lieu et des bénéficiaires suivis suivent.

### Scénario: Le médiateur supprime un accompagnement individuel anonyme

* Étant donné un médiateur ayant accompagné une personne anonyme au lieu d'activité
* Quand le médiateur supprime cette activité de médiation
* Alors la suppression de l'activité de médiation réussit
* Et l'activité de médiation est marquée supprimée
* Et l'activité de médiation n'a plus d'accompagnement ni de tag
* Et la personne anonyme n'existe plus
* Et le médiateur compte 0 activité et 0 accompagnement
* Et le lieu d'activité compte 0 activité

### Scénario: Le médiateur supprime un atelier mêlant bénéficiaires suivis et anonymes

* Étant donné un médiateur ayant animé un atelier pour 2 bénéficiaires suivis et 3 personnes anonymes
* Quand le médiateur supprime cette activité de médiation
* Alors la suppression de l'activité de médiation réussit
* Et les personnes anonymes n'existent plus
* Et chaque bénéficiaire suivi compte 0 accompagnement
* Et le médiateur compte 0 activité et 0 accompagnement

### Scénario: Le premier accompagnement passe à l'activité suivante

* Étant donné un bénéficiaire suivi accompagné le 3 mars puis le 10 mars
* Quand le médiateur supprime l'accompagnement du 3 mars
* Alors l'accompagnement du "10 mars" devient le premier accompagnement du bénéficiaire

### Scénario: À date égale, le premier accompagnement revient au premier enregistré

* Étant donné un bénéficiaire suivi accompagné le 3 mars puis deux fois le 10 mars, enregistré à 9 h et à 14 h
* Quand le médiateur supprime l'accompagnement du 3 mars
* Alors l'accompagnement du "10 mars à 9 h" devient le premier accompagnement du bénéficiaire
* Et l'accompagnement du "10 mars à 14 h" n'est pas le premier accompagnement du bénéficiaire

## Règle: Personne d'autre ne supprime l'activité d'un médiateur

### Scénario: Un autre médiateur tente la suppression

* Étant donné un médiateur ayant accompagné une personne anonyme au lieu d'activité
* Quand un autre médiateur supprime cette activité de médiation
* Alors la suppression de l'activité de médiation échoue avec "ActiviteIntrouvable"
* Et l'activité de médiation n'est pas marquée supprimée

### Scénario: Une activité déjà supprimée est introuvable

* Étant donné un médiateur ayant accompagné une personne anonyme au lieu d'activité
* Quand le médiateur supprime cette activité de médiation
* Et le médiateur supprime cette activité de médiation
* Alors la suppression de l'activité de médiation échoue avec "ActiviteIntrouvable"
