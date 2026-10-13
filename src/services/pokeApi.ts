import { API_BASE_URL } from '../constants/api';
import {
  Pokemon,
  PokemonApiDetail,
  PokemonListResponse,
  PokemonPage,
} from '../types/pokemon';

export class PokemonServiceError extends Error {
  statusCode?: number;
  isNotFound?: boolean;
  isCancelled?: boolean;

  constructor(message: string, statusCode?: number, isNotFound = false, isCancelled = false) {
    super(message);
    this.name = 'PokemonServiceError';
    this.statusCode = statusCode;
    this.isNotFound = isNotFound;
    this.isCancelled = isCancelled;
  }
}

/**
 * Normalizes a Pokémon search input.
 * Trims leading/trailing whitespace, converts alphabetic characters to lowercase,
 * preserves valid hyphens and numerical IDs.
 */
export function normalizeSearchTerm(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new PokemonServiceError('Por favor, informe o nome ou ID do Pokémon.');
  }

  // If it's a pure number, keep it as is
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  // Lowercase letters and retain valid hyphenated names (e.g., "mr-mime", "tapu-koko")
  return trimmed.toLowerCase();
}

/**
 * Maps external PokéAPI raw response to the application's domain model.
 */
export function mapPokemonApiToPokemon(data: PokemonApiDetail): Pokemon {
  const officialArtwork = data.sprites?.other?.['official-artwork']?.front_default;
  const spriteDefault = data.sprites?.front_default;
  const imageUrl = officialArtwork || spriteDefault || null;

  return {
    id: data.id,
    name: data.name,
    order: data.order,
    height: data.height,
    weight: data.weight,
    abilities: (data.abilities || []).map((abilityItem) => ({
      name: abilityItem.ability.name,
      isHidden: abilityItem.is_hidden,
    })),
    imageUrl,
  };
}

/**
 * Fetches a single Pokémon's detailed data by its name or ID.
 */
export async function fetchPokemonByNameOrId(
  nameOrId: string,
  signal?: AbortSignal
): Promise<Pokemon> {
  const normalized = normalizeSearchTerm(nameOrId);
  const url = `${API_BASE_URL}/pokemon/${encodeURIComponent(normalized)}`;

  try {
    const response = await fetch(url, { signal });

    if (!response.ok) {
      if (response.status === 404) {
        throw new PokemonServiceError(
          'Pokémon não encontrado. Verifique o nome ou ID informado.',
          404,
          true
        );
      }
      throw new PokemonServiceError(
        'Não foi possível consultar o Pokémon. Verifique sua conexão e tente novamente.',
        response.status,
        false
      );
    }

    const data: PokemonApiDetail = await response.json();
    return mapPokemonApiToPokemon(data);
  } catch (error) {
    if (error instanceof PokemonServiceError) {
      throw error;
    }

    if ((error as { name?: string }).name === 'AbortError' || signal?.aborted) {
      throw new PokemonServiceError('Requisição cancelada.', undefined, false, true);
    }

    throw new PokemonServiceError(
      'Não foi possível consultar o Pokémon. Verifique sua conexão e tente novamente.'
    );
  }
}

/**
 * Fetches a single Pokémon detail by name or endpoint URL (used in batch pagination).
 */
export async function fetchPokemonDetail(
  nameOrUrl: string,
  signal?: AbortSignal
): Promise<Pokemon> {
  const url = nameOrUrl.startsWith('http')
    ? nameOrUrl
    : `${API_BASE_URL}/pokemon/${encodeURIComponent(nameOrUrl.toLowerCase())}`;

  try {
    const response = await fetch(url, { signal });

    if (!response.ok) {
      throw new PokemonServiceError(
        'Não foi possível obter os detalhes do Pokémon.',
        response.status
      );
    }

    const data: PokemonApiDetail = await response.json();
    return mapPokemonApiToPokemon(data);
  } catch (error) {
    if (error instanceof PokemonServiceError) {
      throw error;
    }
    if ((error as { name?: string }).name === 'AbortError' || signal?.aborted) {
      throw new PokemonServiceError('Requisição cancelada.', undefined, false, true);
    }
    throw new PokemonServiceError(
      'Não foi possível consultar o Pokémon. Verifique sua conexão e tente novamente.'
    );
  }
}

/**
 * Fetches a paginated list of Pokémon and loads full details for each one.
 * Resolves details concurrently via Promise.allSettled to handle partial failures gracefully.
 */
export async function fetchPokemonPage(
  offset: number,
  limit: number,
  signal?: AbortSignal
): Promise<PokemonPage> {
  const listUrl = `${API_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`;

  let listData: PokemonListResponse;

  try {
    const response = await fetch(listUrl, { signal });

    if (!response.ok) {
      throw new PokemonServiceError(
        'Não foi possível consultar a lista de Pokémon. Verifique sua conexão e tente novamente.',
        response.status
      );
    }

    listData = await response.json();
  } catch (error) {
    if (error instanceof PokemonServiceError) {
      throw error;
    }
    if ((error as { name?: string }).name === 'AbortError' || signal?.aborted) {
      throw new PokemonServiceError('Requisição cancelada.', undefined, false, true);
    }
    throw new PokemonServiceError(
      'Não foi possível consultar a lista de Pokémon. Verifique sua conexão e tente novamente.'
    );
  }

  // Fetch details for each item in the current page concurrently
  const detailPromises = listData.results.map((item) =>
    fetchPokemonDetail(item.url || item.name, signal)
  );

  const results = await Promise.allSettled(detailPromises);

  const successfulPokemons: Pokemon[] = [];
  for (const res of results) {
    if (res.status === 'fulfilled') {
      successfulPokemons.push(res.value);
    }
  }

  // Remove potential duplicates by ID and sort in ascending ID order
  const uniqueMap = new Map<number, Pokemon>();
  for (const p of successfulPokemons) {
    if (!uniqueMap.has(p.id)) {
      uniqueMap.set(p.id, p);
    }
  }

  const items = Array.from(uniqueMap.values()).sort((a, b) => a.id - b.id);

  const nextOffset = listData.next ? offset + limit : null;

  return {
    items,
    nextOffset,
    total: listData.count,
  };
}
