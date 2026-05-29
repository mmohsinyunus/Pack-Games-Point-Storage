export interface Player {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  totalPoints: number;
  createdAt: string;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  suit: string;
  createdAt: string;
}

export interface Round {
  id: string;
  gameId: string;
  gameName: string;
  name: string;
  date: string;
  status: 'open' | 'closed' | 'closing';
  createdAt: string;
  closedAt: string | null;
}

export interface PointEntry {
  id: string;
  roundId: string;
  playerId: string;
  gameId: string;
  points: number;
  recordedAt: string;
}

export interface PlayerScore {
  playerId: string;
  playerName: string;
  avatarColor: string;
  totalPoints: number;
  gamesPlayed: number;
  roundsPlayed: number;
  rank: number;
}

export interface DashboardStats {
  totalPlayers: number;
  totalGames: number;
  totalRounds: number;
  totalPoints: number;
  leaderboard: PlayerScore[];
  recentRounds: Round[];
}

export interface GameStats {
  game: Game;
  roundsCount: number;
  playersCount: number;
  leaderboard: PlayerScore[];
}

export interface PlayerStats {
  player: Player;
  totalPoints: number;
  gamesPlayed: number;
  roundsPlayed: number;
  pointsByGame: { gameId: string; gameName: string; suit: string; totalPoints: number }[];
  recentPoints: (PointEntry & { roundName: string; gameName: string })[];
}

export type SheetName = 'Players' | 'Games' | 'Rounds' | 'Points';
