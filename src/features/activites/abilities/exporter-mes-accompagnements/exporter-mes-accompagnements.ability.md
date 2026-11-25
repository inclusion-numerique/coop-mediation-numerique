# Fonctionnalité: Exporter mes accompagnements

> Le médiateur, ou le coordinateur pour son équipe, télécharge ses
> accompagnements dans un classeur, une ligne par bénéficiaire accompagné. Les
> filtres de l'URL restreignent l'export sans jamais l'élargir au-delà de son
> périmètre.

## Règle: Le médiateur exporte ses seules activités vivantes, les plus récentes d'abord

### Scénario: Une activité supprimée et celle d'un autre médiateur sont écartées

* Étant donné une médiatrice ayant accompagné des bénéficiaires les 3, 5 et 9 mars 2026
* Et son accompagnement du 9 mars 2026 est supprimé
* Et un autre médiateur a accompagné un bénéficiaire le 7 mars 2026
* Quand j'exporte mes accompagnements
* Alors l'export contient les activités du "5 mars, 3 mars"
* Et l'export est personnel

### Scénario: Un atelier collectif compte une ligne par participant

* Étant donné une médiatrice ayant accompagné des bénéficiaires les 3, 5 et 9 mars 2026
* Quand j'exporte mes accompagnements
* Alors l'export contient les activités du "9 mars, 5 mars, 3 mars"
* Et l'export compte 4 accompagnements

## Règle: Les filtres de l'URL restreignent l'export, sans jamais l'élargir

### Scénario: Filtrer les ateliers collectifs

* Étant donné une médiatrice ayant accompagné des bénéficiaires les 3, 5 et 9 mars 2026
* Quand j'exporte mes accompagnements avec "types=collectif"
* Alors l'export contient les activités du "5 mars"

### Scénario: Filtrer sur soi-même ne restreint rien

* Étant donné une médiatrice ayant accompagné des bénéficiaires les 3, 5 et 9 mars 2026
* Quand j'exporte mes accompagnements en filtrant sur moi-même
* Alors l'export contient les activités du "9 mars, 5 mars, 3 mars"

### Scénario: Filtrer sur un médiateur étranger n'exporte rien

* Étant donné une médiatrice ayant accompagné des bénéficiaires les 3, 5 et 9 mars 2026
* Et un autre médiateur a accompagné un bénéficiaire le 7 mars 2026
* Quand j'exporte mes accompagnements en filtrant sur l'autre médiateur
* Alors l'export ne contient aucune activité

### Scénario: Une valeur de filtre invalide ne restreint rien

* Étant donné une médiatrice ayant accompagné des bénéficiaires les 3, 5 et 9 mars 2026
* Quand j'exporte mes accompagnements avec "lieux=x') OR 1=1 --"
* Alors l'export contient les activités du "9 mars, 5 mars, 3 mars"

## Règle: Le coordinateur exporte son équipe, un ancien membre seulement pour sa période d'appartenance

### Scénario: L'activité d'un ancien membre après son départ est écartée

* Étant donné un coordinateur dont un ancien membre a accompagné des bénéficiaires les 3 et 9 mars 2026, parti le 6 mars 2026
* Quand le coordinateur exporte les accompagnements de son équipe
* Alors l'export contient les activités du "3 mars"
* Et l'export n'est pas personnel
* Et l'export affiche la source des données

## Règle: L'export se lit par lots, sans doublon ni saut

### Scénario: Des activités enregistrées au même instant sont toutes exportées une fois

* Étant donné une médiatrice ayant accompagné 501 bénéficiaires au même instant
* Quand j'exporte mes accompagnements
* Alors l'export contient 501 activités distinctes

## Règle: Le classeur ne nomme que les filtres actifs, dans le périmètre de l'export

### Scénario: L'employeuse d'un autre médiateur n'est pas nommée

* Étant donné une médiatrice ayant accompagné des bénéficiaires les 3, 5 et 9 mars 2026
* Et son accompagnement du 3 mars 2026 était pour l'employeuse "Mairie de Lyon"
* Et un autre médiateur a accompagné un bénéficiaire le 7 mars 2026 pour l'employeuse "Conseil départemental"
* Quand je nomme les filtres de mon export sur les employeuses "Mairie de Lyon, Conseil départemental"
* Alors les employeuses nommées sont "Mairie de Lyon"

### Scénario: Un médiateur étranger n'est pas nommé

* Étant donné une médiatrice "Ada Lovelace" ayant accompagné des bénéficiaires les 3, 5 et 9 mars 2026
* Et un autre médiateur a accompagné un bénéficiaire le 7 mars 2026
* Quand je nomme les filtres de mon export sur moi-même et l'autre médiateur
* Alors seule la médiatrice "Ada Lovelace" est nommée

### Scénario: Sans filtre actif, aucun nom n'est recherché

* Étant donné une médiatrice ayant accompagné des bénéficiaires les 3, 5 et 9 mars 2026
* Quand je nomme les filtres de mon export sans filtre
* Alors aucun nom de filtre n'a été recherché
