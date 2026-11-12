# Feature: Exporter mes accompagnements

> Le médiateur, ou le coordinateur pour son équipe, télécharge ses
> accompagnements dans un classeur, une ligne par bénéficiaire accompagné. Les
> filtres de l'URL restreignent l'export sans jamais l'élargir au-delà de son
> périmètre.

## Rule: Le médiateur exporte ses seules activités vivantes, les plus récentes d'abord

### Scenario: Une activité supprimée et celle d'un autre médiateur sont écartées

* Given une médiatrice ayant accompagné des bénéficiaires les 3, 5 et 9 mars 2026
* And son accompagnement du 9 mars 2026 est supprimé
* And un autre médiateur a accompagné un bénéficiaire le 7 mars 2026
* When j'exporte mes accompagnements
* Then l'export contient les activités du "5 mars, 3 mars"
* And l'export est personnel

### Scenario: Un atelier collectif compte une ligne par participant

* Given une médiatrice ayant accompagné des bénéficiaires les 3, 5 et 9 mars 2026
* When j'exporte mes accompagnements
* Then l'export contient les activités du "9 mars, 5 mars, 3 mars"
* And l'export compte 4 accompagnements

## Rule: Les filtres de l'URL restreignent l'export, sans jamais l'élargir

### Scenario: Filtrer les ateliers collectifs

* Given une médiatrice ayant accompagné des bénéficiaires les 3, 5 et 9 mars 2026
* When j'exporte mes accompagnements avec "types=collectif"
* Then l'export contient les activités du "5 mars"

### Scenario: Filtrer sur soi-même ne restreint rien

* Given une médiatrice ayant accompagné des bénéficiaires les 3, 5 et 9 mars 2026
* When j'exporte mes accompagnements en filtrant sur moi-même
* Then l'export contient les activités du "9 mars, 5 mars, 3 mars"

### Scenario: Filtrer sur un médiateur étranger n'exporte rien

* Given une médiatrice ayant accompagné des bénéficiaires les 3, 5 et 9 mars 2026
* And un autre médiateur a accompagné un bénéficiaire le 7 mars 2026
* When j'exporte mes accompagnements en filtrant sur l'autre médiateur
* Then l'export ne contient aucune activité

### Scenario: Une valeur de filtre invalide ne restreint rien

* Given une médiatrice ayant accompagné des bénéficiaires les 3, 5 et 9 mars 2026
* When j'exporte mes accompagnements avec "lieux=x') OR 1=1 --"
* Then l'export contient les activités du "9 mars, 5 mars, 3 mars"

## Rule: Le coordinateur exporte son équipe, un ancien membre seulement pour sa période d'appartenance

### Scenario: L'activité d'un ancien membre après son départ est écartée

* Given un coordinateur dont un ancien membre a accompagné des bénéficiaires les 3 et 9 mars 2026, parti le 6 mars 2026
* When le coordinateur exporte les accompagnements de son équipe
* Then l'export contient les activités du "3 mars"
* And l'export n'est pas personnel
* And l'export affiche la source des données

## Rule: L'export se lit par lots, sans doublon ni saut

### Scenario: Des activités enregistrées au même instant sont toutes exportées une fois

* Given une médiatrice ayant accompagné 501 bénéficiaires au même instant
* When j'exporte mes accompagnements
* Then l'export contient 501 activités distinctes
