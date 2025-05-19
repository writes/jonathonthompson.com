export const typeDefs = `#graphql
  scalar DateTime

  type Query {
    topPlayers(region: Region!): [Player!]!
    player(region: Region!, summonerId: String!): Player
    currentGame(region: Region!, summonerId: String!): CurrentGameInfo
  }

  type Subscription {
    playerGameUpdate(summonerId: String!): PlayerGameUpdate!
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
`;