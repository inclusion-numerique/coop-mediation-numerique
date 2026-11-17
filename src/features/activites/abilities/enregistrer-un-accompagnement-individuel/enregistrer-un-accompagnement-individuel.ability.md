# Feature: Enregistrer un accompagnement individuel

## Rule: Le médiateur enregistre et modifie ses accompagnements individuels

> L'accompagnement d'un bénéficiaire suivi compte pour lui, pour le médiateur
> et pour le lieu d'activité. Un accompagnement anonyme crée une personne
> anonyme rattachée à cette seule activité.

### Scenario: Le médiateur accompagne un bénéficiaire suivi à son lieu d'activité

* Given un médiateur exerçant dans un lieu, avec un bénéficiaire suivi
* When le médiateur enregistre l'accompagnement de ce bénéficiaire à son lieu d'activité
* Then l'enregistrement de l'accompagnement individuel réussit
* And l'accompagnement est le premier accompagnement du bénéficiaire
* And le bénéficiaire, le médiateur et le lieu comptent chacun 1 accompagnement

### Scenario: Le médiateur accompagne une personne anonyme à domicile

* Given un médiateur exerçant dans un lieu, avec un bénéficiaire suivi
* When le médiateur enregistre l'accompagnement d'une personne anonyme déjà accompagnée, à domicile à Lyon
* Then l'enregistrement de l'accompagnement individuel réussit
* And une personne anonyme est accompagnée à Lyon, sans que ce soit son premier accompagnement

### Scenario: Le médiateur modifie la durée de son accompagnement

* Given un médiateur ayant enregistré l'accompagnement de son bénéficiaire suivi
* When le médiateur porte la durée de cet accompagnement à 45 minutes
* Then l'enregistrement de l'accompagnement individuel réussit
* And l'accompagnement dure 45 minutes
* And le bénéficiaire, le médiateur et le lieu comptent chacun 1 accompagnement

## Rule: L'accompagnement ne cite que ce qui appartient au médiateur

### Scenario: Un autre médiateur tente de modifier l'accompagnement

* Given un médiateur ayant enregistré l'accompagnement de son bénéficiaire suivi
* When un autre médiateur porte la durée de cet accompagnement à 45 minutes
* Then l'enregistrement de l'accompagnement individuel échoue avec "ActiviteIntrouvable"

### Scenario: Le bénéficiaire d'un autre médiateur est refusé

* Given un médiateur exerçant dans un lieu, avec un bénéficiaire suivi
* When un autre médiateur enregistre l'accompagnement de ce bénéficiaire
* Then l'enregistrement de l'accompagnement individuel échoue avec "BeneficiaireIntrouvable"

### Scenario: Un lieu où le médiateur n'exerce pas est refusé

* Given un médiateur exerçant dans un lieu, avec un bénéficiaire suivi
* When le médiateur enregistre l'accompagnement de ce bénéficiaire dans un lieu qui ne lui est pas ouvert
* Then l'enregistrement de l'accompagnement individuel échoue avec "LieuInutilisable"

### Scenario: Un atelier ne devient pas un accompagnement individuel

* Given un médiateur ayant animé un atelier collectif
* When le médiateur enregistre cet atelier comme un accompagnement individuel
* Then l'enregistrement de l'accompagnement individuel échoue avec "TypeDActiviteIncompatible"
