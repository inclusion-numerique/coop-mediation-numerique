# Feature: Compter les thématiques abordées avec un bénéficiaire

> La fiche d'un bénéficiaire résume les thématiques vues avec lui : chaque
> thématique compte les activités vivantes du médiateur où il a été accompagné.

## Rule: Chaque thématique compte les activités vivantes du médiateur où le bénéficiaire a été accompagné

### Scenario: Une activité supprimée, celle d'un autre bénéficiaire et celle d'un autre médiateur sont écartées

* Given un bénéficiaire accompagné sur les thématiques "Email, Sante", puis "Email", puis "AideAuxDemarchesAdministratives, Logement"
* And une activité supprimée l'avait accompagné sur la thématique "Justice"
* And un autre bénéficiaire du médiateur a été accompagné sur la thématique "Parentalite"
* And un autre médiateur l'a accompagné sur la thématique "Bureautique"
* When je compte les thématiques abordées avec ce bénéficiaire
* Then les thématiques abordées sont "AideAuxDemarchesAdministratives: 1, Email: 2, Logement: 1, Sante: 1"

### Scenario: Un bénéficiaire jamais accompagné n'a abordé aucune thématique

* Given un bénéficiaire jamais accompagné
* When je compte les thématiques abordées avec ce bénéficiaire
* Then aucune thématique n'a été abordée
