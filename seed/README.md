# Seed Data Notes

Seed now imports EPL 2024/25 completed fixtures from Pulselive and computes standings snapshots by matchweek.

- competition id: `1` (Premier League)
- season label lookup: `2024/25`
- expected compSeasonId: `719`

The importer derives teams from fixture payloads and stores:
- 1 season (`PL 2024/25`)
- 20 teams
- all completed season fixtures
- standings snapshots across matchweeks
