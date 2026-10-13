export type ViewMode = 'search' | 'all';

export interface NamedApiResource {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedApiResource[];
}

export interface PokemonAbilityApi {
  ability: NamedApiResource;
  is_hidden: boolean;
  slot: number;
}

export interface PokemonSpritesApi {
  front_default: string | null;
  other?: {
    'official-artwork'?: {
      front_default: string | null;
    };
  };
}

export interface PokemonApiDetail {
  id: number;
  name: string;
  order: number;
  height: number;
  weight: number;
  abilities: PokemonAbilityApi[];
  sprites: PokemonSpritesApi;
}

export interface PokemonAbility {
  name: string;
  isHidden: boolean;
}

export interface Pokemon {
  id: number;
  name: string;
  order: number;
  height: number;
  weight: number;
  abilities: PokemonAbility[];
  imageUrl: string | null;
}

export interface PokemonPage {
  items: Pokemon[];
  nextOffset: number | null;
  total: number;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  isNotFound?: boolean;
}
