# Fonctionnalité: Compter les thématiques abordées avec un bénéficiaire

> La fiche d'un bénéficiaire résume les thématiques vues avec lui : chaque
> thématique compte les activités vivantes du médiateur où il a été accompagné.

## Règle: Chaque thématique compte les activités vivantes du médiateur où le bénéficiaire a été accompagné

### Scénario: Une activité supprimée, celle d'un autre bénéficiaire et celle d'un autre médiateur sont écartées

* Étant donné un bénéficiaire accompagné sur les thématiques "Email, Sante", puis "Email", puis "AideAuxDemarchesAdministratives, Logement"
* Et une activité supprimée l'avait accompagné sur la thématique "Justice"
* Et un autre bénéficiaire du médiateur a été accompagné sur la thématique "Parentalite"
* Et un autre médiateur l'a accompagné sur la thématique "Bureautique"
* Quand je compte les thématiques abordées avec ce bénéficiaire
* Alors les thématiques abordées sont "AideAuxDemarchesAdministratives: 1, Email: 2, Logement: 1, Sante: 1"

### Scénario: Un bénéficiaire jamais accompagné n'a abordé aucune thématique

* Étant donné un bénéficiaire jamais accompagné
* Quand je compte les thématiques abordées avec ce bénéficiaire
* Alors aucune thématique n'a été abordée
