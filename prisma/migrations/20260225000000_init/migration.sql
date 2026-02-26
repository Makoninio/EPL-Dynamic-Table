-- CreateTable
CREATE TABLE "seasons" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT NOT NULL,
    "crest_url" TEXT NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" SERIAL NOT NULL,
    "season_id" INTEGER NOT NULL,
    "matchweek" INTEGER NOT NULL,
    "kickoff_utc" TIMESTAMP(3) NOT NULL,
    "home_team_id" INTEGER NOT NULL,
    "away_team_id" INTEGER NOT NULL,
    "home_goals" INTEGER NOT NULL,
    "away_goals" INTEGER NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "standings_snapshots" (
    "id" SERIAL NOT NULL,
    "season_id" INTEGER NOT NULL,
    "matchweek" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "played" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "draws" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "gf" INTEGER NOT NULL,
    "ga" INTEGER NOT NULL,
    "gd" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "form5" TEXT NOT NULL,

    CONSTRAINT "standings_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "matches_season_id_matchweek_idx" ON "matches"("season_id", "matchweek");

-- CreateIndex
CREATE UNIQUE INDEX "standings_snapshots_season_id_matchweek_team_id_key" ON "standings_snapshots"("season_id", "matchweek", "team_id");

-- CreateIndex
CREATE INDEX "standings_snapshots_season_id_matchweek_idx" ON "standings_snapshots"("season_id", "matchweek");

-- CreateIndex
CREATE INDEX "standings_snapshots_season_id_team_id_idx" ON "standings_snapshots"("season_id", "team_id");

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standings_snapshots" ADD CONSTRAINT "standings_snapshots_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standings_snapshots" ADD CONSTRAINT "standings_snapshots_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
