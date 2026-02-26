# Import placeholders

Expected formats for future real-data import:

## teams.json
```json
[{"name":"Arbor FC","shortName":"ARB","crestUrl":"https://example.com/crest-arb.svg"}]
```

## matches.csv
Columns:
`seasonName,matchweek,kickoffUtc,homeShort,awayShort,homeGoals,awayGoals`

## standings_snapshots.csv
Columns:
`seasonName,matchweek,teamShort,points,played,wins,draws,losses,gf,ga,gd,position,form5`

Use `apps/api/src/scripts/import.ts` as starting point for bulk loaders.
