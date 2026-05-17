export interface SncfTrainCardConfig {
  device_id: string;
  title: string;
  train_lines: number;
  train_emoji: string;
  train_emoji_axial_symmetry: boolean;
  departure_station_emoji: string;
  arrival_station_emoji: string;
  show_departure_station: boolean;
  show_arrival_station: boolean;
  animation_duration: number;
  update_interval: number;
}

export const DEFAULT_CONFIG: SncfTrainCardConfig = {
  device_id: '',
  title: 'Trains SNCF',
  train_lines: 3,
  train_emoji: '🚅',
  train_emoji_axial_symmetry: true,
  departure_station_emoji: '',
  arrival_station_emoji: '🚉',
  show_departure_station: true,
  show_arrival_station: true,
  animation_duration: 30,
  update_interval: 30_000
};

export type TrainAttributes = {
  departure_time?: string;
  arrival_time?: string;
  base_departure_time?: string;
  base_arrival_time?: string;
  delay_minutes?: number;
  has_delay?: boolean;
  [key: string]: unknown;
};

export type HassLike = {
  states?: Record<string, { entity_id: string; attributes?: TrainAttributes }>;
  callWS?: (payload: { type: string }) => Promise<Array<{ entity_id: string; device_id?: string }>>;
};

export type CardMetadata = {
  type: string;
  name: string;
  description: string;
  preview?: boolean;
  configurable?: boolean;
  documentationURL? :string;
};

