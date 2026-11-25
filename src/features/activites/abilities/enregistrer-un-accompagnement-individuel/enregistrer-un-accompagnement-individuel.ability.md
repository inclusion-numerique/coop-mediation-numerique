# Fonctionnalité: Enregistrer un accompagnement individuel

## Règle: Le médiateur enregistre et modifie ses accompagnements individuels

> L'accompagnement d'un bénéficiaire suivi compte pour lui, pour le médiateur
> et pour le lieu d'activité. Un accompagnement anonyme crée une personne
> anonyme rattachée à cette seule activité.

### Scénario: Le médiateur accompagne un bénéficiaire suivi à son lieu d'activité

* Étant donné un médiateur exerçant dans un lieu, avec un bénéficiaire suivi
* Quand le médiateur enregistre l'accompagnement de ce bénéficiaire à son lieu d'activité
* Alors l'enregistrement de l'accompagnement individuel réussit
* Et l'accompagnement est le premier accompagnement du bénéficiaire
* Et le bénéficiaire, le médiateur et le lieu comptent chacun 1 accompagnement

### Scénario: Le médiateur accompagne une personne anonyme à domicile

* Étant donné un médiateur exerçant dans un lieu, avec un bénéficiaire suivi
* Quand le médiateur enregistre l'accompagnement d'une personne anonyme déjà accompagnée, à domicile à Lyon
* Alors l'enregistrement de l'accompagnement individuel réussit
* Et une personne anonyme est accompagnée à Lyon, sans que ce soit son premier accompagnement

### Scénario: Le médiateur modifie la durée de son accompagnement

* Étant donné un médiateur ayant enregistré l'accompagnement de son bénéficiaire suivi
* Quand le médiateur porte la durée de cet accompagnement à 45 minutes
* Alors l'enregistrement de l'accompagnement individuel réussit
* Et l'accompagnement dure 45 minutes
* Et le bénéficiaire, le médiateur et le lieu comptent chacun 1 accompagnement

## Règle: L'accompagnement ne cite que ce qui appartient au médiateur

### Scénario: Un autre médiateur tente de modifier l'accompagnement

* Étant donné un médiateur ayant enregistré l'accompagnement de son bénéficiaire suivi
* Quand un autre médiateur porte la durée de cet accompagnement à 45 minutes
* Alors l'enregistrement de l'accompagnement individuel échoue avec "ActiviteIntrouvable"

### Scénario: Le bénéficiaire d'un autre médiateur est refusé

* Étant donné un médiateur exerçant dans un lieu, avec un bénéficiaire suivi
* Quand un autre médiateur enregistre l'accompagnement de ce bénéficiaire
* Alors l'enregistrement de l'accompagnement individuel échoue avec "BeneficiaireIntrouvable"

### Scénario: Un lieu où le médiateur n'exerce pas est refusé

* Étant donné un médiateur exerçant dans un lieu, avec un bénéficiaire suivi
* Quand le médiateur enregistre l'accompagnement de ce bénéficiaire dans un lieu qui ne lui est pas ouvert
* Alors l'enregistrement de l'accompagnement individuel échoue avec "LieuInutilisable"

### Scénario: Un atelier ne devient pas un accompagnement individuel

* Étant donné un médiateur ayant animé un atelier collectif
* Quand le médiateur enregistre cet atelier comme un accompagnement individuel
* Alors l'enregistrement de l'accompagnement individuel échoue avec "TypeDActiviteIncompatible"
