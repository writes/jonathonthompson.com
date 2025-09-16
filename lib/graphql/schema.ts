export const typeDefs = `#graphql
  scalar DateTime

  type Query {
    topPlayers(region: Region!): [Player!]!
    player(region: Region!, summonerId: String!): Player
    currentGame(region: Region!, summonerId: String!): CurrentGameInfo
  }

  type Subscription {
    playerGameUpdate(summonerId: String!): PlayerGameUpdate!
    matchUpdated(matchId: String!): Match!
    playerStatusChanged(playerId: String!): PlayerStatus!
    tournamentUpdated(tournamentId: String!): Tournament!
    leaderboardChanged(region: Region!): LeaderboardUpdate!
  }

  enum Region {
    NA1
    EUW1
    EUN1
    KR
    BR1
    JP1
    LA1
    LA2
    OC1
    TR1
    RU
  }

  enum Tier {
    CHALLENGER
    GRANDMASTER
    MASTER
    DIAMOND
    EMERALD
    PLATINUM
    GOLD
    SILVER
    BRONZE
    IRON
  }

  enum Division {
    I
    II
    III
    IV
  }

  type Player {
    id: String!
    accountId: String!
    puuid: String!
    profileIconId: Int!
    summonerLevel: Int!
    summonerName: String!
    region: Region!
    leagueEntry: LeagueEntry
    recentMatches: [Match!]!
    currentGame: CurrentGameInfo
    lastChampionPlayed: Champion
  }

  type LeagueEntry {
    tier: Tier!
    division: Division!
    leaguePoints: Int!
    wins: Int!
    losses: Int!
    winRate: Float!
    hotStreak: Boolean!
    veteran: Boolean!
    freshBlood: Boolean!
    inactive: Boolean!
  }

  type CurrentGameInfo {
    gameId: String!
    gameType: String!
    gameStartTime: DateTime!
    mapId: Int!
    gameLength: Int!
    gameMode: String!
    participants: [CurrentGameParticipant!]!
  }

  type CurrentGameParticipant {
    teamId: Int!
    championId: Int!
    champion: Champion!
    summonerId: String!
    summoner: Player!
    perks: Perks!
  }

  type Perks {
    perkIds: [Int!]!
    perkStyle: Int!
    perkSubStyle: Int!
  }

  type Match {
    matchId: String!
    gameCreation: DateTime!
    gameDuration: Int!
    gameMode: String!
    gameType: String!
    participants: [Participant!]!
    queueId: Int!
  }

  type Participant {
    summonerId: String!
    summonerName: String!
    championId: Int!
    champion: Champion!
    teamId: Int!
    win: Boolean!
    kills: Int!
    deaths: Int!
    assists: Int!
    kda: Float!
    goldEarned: Int!
    totalDamageDealtToChampions: Int!
    visionScore: Int!
    items: [Int!]!
  }

  type Champion {
    id: Int!
    key: String!
    name: String!
    title: String!
    image: ChampionImage!
  }

  type ChampionImage {
    full: String!
    sprite: String!
    group: String!
    x: Int!
    y: Int!
    w: Int!
    h: Int!
  }

  type PlayerGameUpdate {
    type: UpdateType!
    summonerId: String!
    gameId: String
    champion: Champion
    timestamp: DateTime!
  }

  enum UpdateType {
    ENTERED_GAME
    LEFT_GAME
    GAME_UPDATE
  }

  type PlayerStatus {
    playerId: String!
    online: Boolean!
    inGame: Boolean!
    currentGameId: String
    lastSeen: DateTime!
  }

  type Tournament {
    id: String!
    name: String!
    status: TournamentStatus!
    format: TournamentFormat!
    currentRound: Int!
    totalRounds: Int!
    participants: [TournamentParticipant!]!
    matches: [TournamentMatch!]!
    startDate: DateTime!
    endDate: DateTime
  }

  enum TournamentStatus {
    UPCOMING
    IN_PROGRESS
    COMPLETED
    CANCELLED
  }

  enum TournamentFormat {
    SINGLE_ELIMINATION
    DOUBLE_ELIMINATION
    SWISS
    ROUND_ROBIN
  }

  type TournamentParticipant {
    id: String!
    playerId: String!
    playerName: String!
    seed: Int!
    wins: Int!
    losses: Int!
    eliminated: Boolean!
  }

  type TournamentMatch {
    id: String!
    round: Int!
    player1Id: String!
    player2Id: String!
    winnerId: String
    status: MatchStatus!
    startTime: DateTime
    endTime: DateTime
  }

  enum MatchStatus {
    SCHEDULED
    IN_PROGRESS
    COMPLETED
    FORFEIT
  }

  type LeaderboardUpdate {
    region: Region!
    timestamp: DateTime!
    changes: [LeaderboardChange!]!
  }

  type LeaderboardChange {
    playerId: String!
    playerName: String!
    previousRank: Int!
    newRank: Int!
    lpChange: Int!
  }
`;