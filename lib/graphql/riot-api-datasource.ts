interface RiotAPIOptions {
  cache?: any;
}

export class RiotAPI {
  private apiKey: string;
  private cache?: any;
  
  constructor(apiKey: string, options?: RiotAPIOptions) {
    this.apiKey = apiKey;
    this.cache = options?.cache;
  }

  private getRegionalRoute(platform: string): string {
    const routingMap: Record<string, string> = {
      'na1': 'americas',
      'br1': 'americas',
      'la1': 'americas',
      'la2': 'americas',
      'euw1': 'europe',
      'eun1': 'europe',
      'tr1': 'europe',
      'ru': 'europe',
      'kr': 'asia',
      'jp1': 'asia',
      'oc1': 'sea'
    };
    return routingMap[platform.toLowerCase()] || 'americas';
  }

  private async fetchWithAuth(url: string) {
    const response = await fetch(url, {
      headers: {
        'X-Riot-Token': this.apiKey
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Riot API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getSummonerByName(region: string, summonerName: string) {
    const url = `https://${region.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`;
    return this.fetchWithAuth(url);
  }

  async getSummonerById(region: string, summonerId: string) {
    const url = `https://${region.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/${summonerId}`;
    return this.fetchWithAuth(url);
  }

  async getLeagueEntries(region: string, summonerId: string) {
    const url = `https://${region.toLowerCase()}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`;
    return this.fetchWithAuth(url);
  }

  async getChallengerLeague(region: string, queue: string = 'RANKED_SOLO_5x5') {
    const url = `https://${region.toLowerCase()}.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/${queue}`;
    return this.fetchWithAuth(url);
  }

  async getCurrentGameInfo(region: string, summonerId: string) {
    const url = `https://${region.toLowerCase()}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerId}`;
    return this.fetchWithAuth(url);
  }

  async getMatchIds(region: string, puuid: string, count: number = 10) {
    const regionalRoute = this.getRegionalRoute(region);
    const url = `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;
    return this.fetchWithAuth(url);
  }

  async getMatch(region: string, matchId: string) {
    const regionalRoute = this.getRegionalRoute(region);
    const url = `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
    return this.fetchWithAuth(url);
  }

  async getAccountByPuuid(puuid: string) {
    const regionalRoute = 'americas'; // Account API uses regional routes
    const url = `https://${regionalRoute}.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}`;
    return this.fetchWithAuth(url);
  }

  getChampionImageUrl(championKey: string): string {
    return `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${championKey}.png`;
  }

  getProfileIconUrl(iconId: number): string {
    return `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/${iconId}.png`;
  }
}