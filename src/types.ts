export interface StationResponse {
  result: boolean;
  data: Station[];
  count: number;
  description: string;
}

export interface Station {
  Name: string;
  Prefix: string;
  DifficultyLevel: number;
  Latititude: number;
  Longitude: number;
  MainImageURL: string;
  AdditionalImage1URL: string;
  AdditionalImage2URL: string;
  DispatchedBy: DispatchedBy[];
  id: string;
}

export interface DispatchedBy {
  ServerCode: string;
  SteamId: string;
}

export interface ServersResponse {
  result: boolean;
  data: Server[];
  count: number;
  description: string;
}

export interface Server {
  ServerCode: string;
  ServerName: string;
  ServerRegion: ServerRegion;
  IsActive: boolean;
  id: string;
}

export enum ServerRegion {
  Asia = "Asia",
  Europe = "Europe",
  NorthAmerica = "North_America",
}
