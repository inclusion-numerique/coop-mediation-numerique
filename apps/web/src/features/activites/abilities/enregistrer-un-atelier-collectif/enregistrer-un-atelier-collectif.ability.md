# Feature: Enregistrer un atelier collectif

## Rule: Le médiateur enregistre et modifie ses ateliers

> Chaque bénéficiaire suivi compte l'atelier parmi ses accompagnements. Les
> participants anonymes sont créés pour cet atelier, selon la répartition
> déclarée ; le reliquat est non communiqué.

### Scenario: Le médiateur anime un atelier pour des bénéficiaires suivis et des anonymes

* Given un médiateur ayant 2 bénéficiaires suivis
* When le médiateur enregistre un atelier pour ses 2 bénéficiaires suivis et 3 anonymes, dont 2 femmes et 1 déjà accompagné
* Then l'enregistrement de l'atelier collectif réussit
* And l'atelier compte 5 accompagnements, dont 3 anonymes et 2 femmes
* And 1 participant anonyme n'en est pas à son premier accompagnement
* And chaque bénéficiaire suivi de l'atelier compte 1 accompagnement
* And le médiateur compte 1 activité et 5 accompagnements

### Scenario: Le médiateur retire un bénéficiaire suivi et réduit les anonymes

* Given un médiateur ayant enregistré un atelier pour ses 2 bénéficiaires suivis et 3 anonymes
* When le médiateur ne garde dans cet atelier que son premier bénéficiaire suivi et 1 anonyme
* Then l'enregistrement de l'atelier collectif réussit
* And l'atelier compte 2 accompagnements, dont 1 anonymes et 0 femmes
* And le bénéficiaire retiré compte 0 accompagnement
* And le médiateur compte 1 activité et 2 accompagnements

## Rule: L'atelier ne cite que ce qui appartient au médiateur

### Scenario: Le bénéficiaire d'un autre médiateur est refusé

* Given un médiateur ayant 2 bénéficiaires suivis
* When un autre médiateur enregistre un atelier pour ces bénéficiaires
* Then l'enregistrement de l'atelier collectif échoue avec "BeneficiaireIntrouvable"

### Scenario: Un atelier sans participant est refusé

* Given un médiateur ayant 2 bénéficiaires suivis
* When le médiateur enregistre un atelier sans participant
* Then l'enregistrement de l'atelier collectif échoue avec "AtelierSansParticipant"

### Scenario: Un accompagnement individuel ne devient pas un atelier

* Given un médiateur ayant accompagné individuellement un bénéficiaire suivi
* When le médiateur enregistre cet accompagnement comme un atelier
* Then l'enregistrement de l'atelier collectif échoue avec "TypeDActiviteIncompatible"
