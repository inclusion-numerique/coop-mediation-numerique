# Fonctionnalité: Enregistrer un atelier collectif

## Règle: Le médiateur enregistre et modifie ses ateliers

> Chaque bénéficiaire suivi compte l'atelier parmi ses accompagnements. Les
> participants anonymes sont créés pour cet atelier, selon la répartition
> déclarée ; le reliquat est non communiqué.

### Scénario: Le médiateur anime un atelier pour des bénéficiaires suivis et des anonymes

* Étant donné un médiateur ayant 2 bénéficiaires suivis
* Quand le médiateur enregistre un atelier pour ses 2 bénéficiaires suivis et 3 anonymes, dont 2 femmes et 1 déjà accompagné
* Alors l'enregistrement de l'atelier collectif réussit
* Et l'atelier compte 5 accompagnements, dont 3 anonymes et 2 femmes
* Et 1 participant anonyme n'en est pas à son premier accompagnement
* Et chaque bénéficiaire suivi de l'atelier compte 1 accompagnement
* Et le médiateur compte 1 activité et 5 accompagnements

### Scénario: Le médiateur retire un bénéficiaire suivi et réduit les anonymes

* Étant donné un médiateur ayant enregistré un atelier pour ses 2 bénéficiaires suivis et 3 anonymes
* Quand le médiateur ne garde dans cet atelier que son premier bénéficiaire suivi et 1 anonyme
* Alors l'enregistrement de l'atelier collectif réussit
* Et l'atelier compte 2 accompagnements, dont 1 anonymes et 0 femmes
* Et le bénéficiaire retiré compte 0 accompagnement
* Et le médiateur compte 1 activité et 2 accompagnements

### Scénario: Un ancien bénéficiaire anonymisé perd l'atelier qu'on réécrit

* Étant donné un médiateur dont un ancien bénéficiaire anonymisé participe à deux ateliers
* Quand le médiateur réécrit le premier de ces ateliers avec 1 anonyme
* Alors l'enregistrement de l'atelier collectif réussit
* Et l'ancien bénéficiaire anonymisé compte 1 accompagnement

## Règle: L'atelier ne cite que ce qui appartient au médiateur

### Scénario: Le bénéficiaire d'un autre médiateur est refusé

* Étant donné un médiateur ayant 2 bénéficiaires suivis
* Quand un autre médiateur enregistre un atelier pour ces bénéficiaires
* Alors l'enregistrement de l'atelier collectif échoue avec "BeneficiaireIntrouvable"

### Scénario: Un atelier sans participant est refusé

* Étant donné un médiateur ayant 2 bénéficiaires suivis
* Quand le médiateur enregistre un atelier sans participant
* Alors l'enregistrement de l'atelier collectif échoue avec "AtelierSansParticipant"

### Scénario: Un accompagnement individuel ne devient pas un atelier

* Étant donné un médiateur ayant accompagné individuellement un bénéficiaire suivi
* Quand le médiateur enregistre cet accompagnement comme un atelier
* Alors l'enregistrement de l'atelier collectif échoue avec "TypeDActiviteIncompatible"
