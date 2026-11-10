# Feature: Supprimer une activité de médiation

## Rule: Le médiateur supprime ses propres activités

> La suppression est douce : l'activité quitte l'historique mais reste en
> base, détachée de ses accompagnements, de ses tags et de son rendez-vous.
> Les compteurs du médiateur, du lieu et des bénéficiaires suivis suivent.

### Scenario: Le médiateur supprime un accompagnement individuel anonyme

* Given un médiateur ayant accompagné une personne anonyme au lieu d'activité
* When le médiateur supprime cette activité de médiation
* Then la suppression de l'activité de médiation réussit
* And l'activité de médiation est marquée supprimée
* And l'activité de médiation n'a plus d'accompagnement ni de tag
* And la personne anonyme n'existe plus
* And le médiateur compte 0 activité et 0 accompagnement
* And le lieu d'activité compte 0 activité

### Scenario: Le médiateur supprime un atelier mêlant bénéficiaires suivis et anonymes

* Given un médiateur ayant animé un atelier pour 2 bénéficiaires suivis et 3 personnes anonymes
* When le médiateur supprime cette activité de médiation
* Then la suppression de l'activité de médiation réussit
* And les personnes anonymes n'existent plus
* And chaque bénéficiaire suivi compte 0 accompagnement
* And le médiateur compte 0 activité et 0 accompagnement

### Scenario: Le premier accompagnement passe à l'activité suivante

* Given un bénéficiaire suivi accompagné le 3 mars puis le 10 mars
* When le médiateur supprime l'accompagnement du 3 mars
* Then l'accompagnement du 10 mars devient le premier accompagnement du bénéficiaire

## Rule: Personne d'autre ne supprime l'activité d'un médiateur

### Scenario: Un autre médiateur tente la suppression

* Given un médiateur ayant accompagné une personne anonyme au lieu d'activité
* When un autre médiateur supprime cette activité de médiation
* Then la suppression de l'activité de médiation échoue avec "ActiviteIntrouvable"
* And l'activité de médiation n'est pas marquée supprimée

### Scenario: Une activité déjà supprimée est introuvable

* Given un médiateur ayant accompagné une personne anonyme au lieu d'activité
* When le médiateur supprime cette activité de médiation
* And le médiateur supprime cette activité de médiation
* Then la suppression de l'activité de médiation échoue avec "ActiviteIntrouvable"
