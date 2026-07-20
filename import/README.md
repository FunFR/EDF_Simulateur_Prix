# import/ — mise à jour des grilles tarifaires depuis les PDFs fournisseurs

Outil local (jamais en CI) qui, pour chaque `price_url` des `defineTarif` du repo :

1. télécharge la grille (requête conditionnelle + comparaison SHA-256 avec `manifest.json`),
2. si elle a changé, extrait le texte du PDF (pdfjs-dist) et parse les prix,
3. patche les fichiers `scripts/tarifs/**` (uniquement les nombres et `lastUpdate`, jamais la structure),
4. met à jour `manifest.json` et la section « Derniers tarifs » du README racine.

**La revue humaine reste obligatoire** : relire `git diff scripts/tarifs`, régénérer les goldens, puis commit.

## Installation

```powershell
cd import
npm ci        # unique dépendance : pdfjs-dist (extraction de texte PDF)
```

Node ≥ 22 requis (comme les tests du repo).

## Usage

```powershell
node update.mjs                     # run complet : check + download + parse + patch
node update.mjs --check-only        # détection réseau seule, ne touche à rien
node update.mjs --dry-run           # tout le pipeline sauf l'écriture
node update.mjs --force             # re-parse même si le SHA-256 n'a pas changé
node update.mjs --offline           # réutilise les PDFs du cache/ (dev, sans réseau)
node update.mjs --provider edf      # limite à un fournisseur
node update.mjs --tarif "EDF - Tempo"
npm test                            # tests unitaires + snapshots des parsers (sans réseau)
```

Workflow après un run qui a modifié des fichiers :

```powershell
git diff scripts/tarifs             # revue des valeurs
$env:UPDATE_GOLDEN='1'; node --test "tests/**/*.test.mjs"; $env:UPDATE_GOLDEN=$null   # depuis la racine
git diff tests/golden               # revue des snapshots de simulation
```

## Statuts du rapport

| Statut | Sens |
|---|---|
| `A JOUR` | 304 ou SHA-256 identique au dernier PDF réconcilié |
| `MODIFIE` | valeurs mises à jour dans les fichiers tarifs (détail affiché) |
| `GRILLE CHANGEE, VALEURS IDENTIQUES` | PDF ré-édité sans changement de prix (réconcilié) |
| `INTERVENTION MANUELLE REQUISE` | divergence **structurelle** : kVA ou type de jour ajouté/supprimé, `priceOverrides` présents d'un seul côté. L'outil ne patche jamais la structure : éditer le fichier tarif à la main, puis relancer |
| `NON GERE (HTML)` | `price_url` non-PDF (Alterna, Gaz de Bordeaux, Enercoop) : vérification manuelle |
| `PARSER MANQUANT` | PDF téléchargé et changement détecté, mais pas de parser (Engie, voir plus bas) |
| `VALEUR INTROUVABLE (patch refuse)` | le littéral attendu n'est plus dans le fichier : rien n'est écrit |
| `ERREUR RESEAU` / `ERREUR PARSING` | à investiguer (URL morte ? mise en page changée ?) |

Le SHA-256 du manifest n'est mis à jour **que** lorsqu'une grille est réconciliée (patch appliqué ou valeurs identiques) : une grille en intervention manuelle re-signale à chaque run tant que le fichier tarif n'a pas été adapté.

## Garde-fous

- Remplacement textuel ancré : un nombre n'est remplacé que si sa valeur actuelle est celle attendue ; tout-ou-rien par fichier.
- Revalidation VM : chaque fichier patché est rechargé avec la vraie factory `defineTarif` (zéro erreur exigée) et chaque valeur est relue avant écriture.
- `lastUpdate` prend la date lue dans le PDF (« Applicable au … ») quand elle existe, sinon la date du jour.
- Les puissances kVA listées par le PDF mais absentes du repo sont ignorées (TotalEnergies liste 3 à 36 kVA, le repo n'en modélise qu'un sous-ensemble). L'inverse (kVA du repo absent du PDF) bloque en manuel.

## Architecture

```
update.mjs            point d'entrée CLI (voir --help ci-dessus)
manifest.json         état persistant par URL { sha256, etag, lastChecked, lastApplied } — committé
lib/
  tarif-defs.mjs      énumère les defineTarif via node:vm (comme tests/helpers/legacyLoader.mjs)
  registry.mjs        URL -> fournisseur/parser ; URLs HTML non gérées
  download.mjs        fetch conditionnel + SHA-256 + cache/ (gitignoré)
  pdf-text.mjs        extraction pdfjs-dist -> items positionnés + reconstruction de lignes/cellules
  table.mjs           détection des tableaux kVA, cellules fusionnées (partition contiguë), buildOffer
  fr-numbers.mjs      nombres français ("19,27", chiffres éclatés "2 1 , 80"), €/kWh -> centimes
  dates.mjs           dates françaises ("1er février 2026", "1 juil. 2026", "12/06/2026", mots éclatés)
  reconcile.mjs       diff parser <-> repo : changements de valeurs vs divergences structurelles
  patch-tarif.mjs     remplacement ciblé dans les littéraux defineTarif (multi-blocs par fichier)
  revalidate.mjs      rechargement VM avec la vraie lib tarifs avant écriture
  readme.mjs          section « Derniers tarifs » du README racine
parsers/<fournisseur>.mjs   un module par fournisseur : parse(doc, url) -> { gridDate, offers }
fixtures/<fournisseur>/     <slug>.json (items extraits), .txt (lisible), .expected.json (snapshot)
tools/
  dump-text.mjs       télécharge les PDFs et régénère les fixtures json+txt
  try-parser.mjs      exécute un parser sur ses fixtures et affiche la réconciliation avec le repo
  gen-expected.mjs    régénère les snapshots .expected.json
tests/                node --test : fr-numbers, patch-tarif, parsers (hermétiques, sans réseau)
```

Contrat parser : les clés de `offers` sont exactement les `name` des `defineTarif` ; prix kWh en **centimes TTC**, abonnements en **€ TTC/mois** ; `priceOverrides` émis quand le PDF différencie certaines puissances (la valeur de référence est celle de la plus grande puissance).

## Quand une grille change de mise en page

Le parser échoue bruyamment (`ERREUR PARSING`, nombre de tableaux/colonnes inattendu) — il ne patche jamais silencieusement faux. Marche à suivre :

```powershell
node tools/dump-text.mjs --provider <fournisseur>   # re-télécharge et régénère les fixtures
# inspecter fixtures/<fournisseur>/<slug>.txt, adapter parsers/<fournisseur>.mjs
node tools/try-parser.mjs <fournisseur>             # itérer jusqu'à cohérence
node tools/gen-expected.mjs                         # re-snapshotter, relire le diff
npm test
```

## Hors périmètre (v1)

- **Alterna, Gaz de Bordeaux, Enercoop** : `price_url` en HTML, vérification manuelle.
- **Engie** : les fiches descriptives décomposent les prix en fourniture + acheminement (TURPE CU/CU4/MUDT/MU4) + obligations, en €/an — la reconstruction du prix TTC mensuel est trop hasardeuse pour un parser fiable. Le changement de grille reste détecté par SHA-256 (`PARSER MANQUANT`). Par ailleurs deux des trois `price_url` Engie du repo renvoient 404 (tranquillité, happy-heures-vertes) : à rafraîchir dans les fichiers tarifs.
- Les nouvelles puissances proposées par un fournisseur (ex. un kVA ajouté au PDF) ne sont pas signalées si le repo ne les modélise pas.
