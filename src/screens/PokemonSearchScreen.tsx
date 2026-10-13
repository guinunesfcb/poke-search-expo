import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  ListRenderItem,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LoadingFooter } from '../components/LoadingFooter';
import { PokemonCard } from '../components/PokemonCard';
import { SearchBar } from '../components/SearchBar';
import { PAGE_SIZE } from '../constants/api';
import {
  fetchPokemonByNameOrId,
  fetchPokemonPage,
  PokemonServiceError,
} from '../services/pokeApi';
import { Pokemon, ViewMode } from '../types/pokemon';

export const PokemonSearchScreen: React.FC = () => {
  // Mode state
  const [viewMode, setViewMode] = useState<ViewMode>('search');

  // Search mode state
  const [searchText, setSearchText] = useState('');
  const [lastSearchedTerm, setLastSearchedTerm] = useState('');
  const [searchResult, setSearchResult] = useState<Pokemon | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // All mode state
  const [allPokemons, setAllPokemons] = useState<Pokemon[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [isLoadingInitialAll, setIsLoadingInitialAll] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allError, setAllError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  // Refresh control state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Concurrency and abort refs
  const searchAbortControllerRef = useRef<AbortController | null>(null);
  const pageAbortControllerRef = useRef<AbortController | null>(null);
  const isFetchingMoreRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      searchAbortControllerRef.current?.abort();
      pageAbortControllerRef.current?.abort();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Search actions
  // ---------------------------------------------------------------------------
  const executeSearch = useCallback(
    async (term: string, isRefresh = false) => {
      const cleanTerm = term.trim();

      if (!cleanTerm) {
        setSearchError('Por favor, informe o nome ou ID do Pokémon.');
        setSearchResult(null);
        return;
      }

      // Abort any ongoing search request
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
      }
      const controller = new AbortController();
      searchAbortControllerRef.current = controller;

      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsSearching(true);
      }
      setSearchError(null);

      try {
        const pokemon = await fetchPokemonByNameOrId(cleanTerm, controller.signal);

        if (!isMountedRef.current || controller.signal.aborted) return;

        setSearchResult(pokemon);
        setLastSearchedTerm(cleanTerm);
      } catch (err) {
        if (!isMountedRef.current || controller.signal.aborted) return;

        const serviceError = err as PokemonServiceError;
        if (serviceError.isCancelled) return;

        setSearchResult(null);
        setSearchError(
          serviceError.message ||
            'Não foi possível consultar o Pokémon. Verifique sua conexão e tente novamente.'
        );
      } finally {
        if (isMountedRef.current) {
          setIsSearching(false);
          setIsRefreshing(false);
        }
      }
    },
    []
  );

  const handleSearchSubmit = useCallback(() => {
    Keyboard.dismiss();
    executeSearch(searchText);
  }, [executeSearch, searchText]);

  const handleClearSearch = useCallback(() => {
    setSearchText('');
    setSearchResult(null);
    setSearchError(null);
    setLastSearchedTerm('');
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
      searchAbortControllerRef.current = null;
    }
  }, []);

  // ---------------------------------------------------------------------------
  // "All" mode actions
  // ---------------------------------------------------------------------------
  const loadInitialAllPokemons = useCallback(
    async (isRefresh = false) => {
      // Abort ongoing page request
      if (pageAbortControllerRef.current) {
        pageAbortControllerRef.current.abort();
      }
      const controller = new AbortController();
      pageAbortControllerRef.current = controller;

      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoadingInitialAll(true);
      }
      setAllError(null);
      setLoadMoreError(null);

      try {
        const page = await fetchPokemonPage(0, PAGE_SIZE, controller.signal);

        if (!isMountedRef.current || controller.signal.aborted) return;

        setAllPokemons(page.items);
        setNextOffset(page.nextOffset);
        setTotalCount(page.total);
      } catch (err) {
        if (!isMountedRef.current || controller.signal.aborted) return;

        const serviceError = err as PokemonServiceError;
        if (serviceError.isCancelled) return;

        setAllError(
          serviceError.message ||
            'Não foi possível consultar a lista de Pokémon. Verifique sua conexão e tente novamente.'
        );
      } finally {
        if (isMountedRef.current) {
          setIsLoadingInitialAll(false);
          setIsRefreshing(false);
        }
      }
    },
    []
  );

  const loadMorePokemons = useCallback(async () => {
    if (viewMode !== 'all') return;
    if (isLoadingInitialAll || isRefreshing || isFetchingMoreRef.current) return;
    if (nextOffset === null) return;

    isFetchingMoreRef.current = true;
    setIsLoadingMore(true);
    setLoadMoreError(null);

    const controller = new AbortController();
    pageAbortControllerRef.current = controller;

    try {
      const page = await fetchPokemonPage(nextOffset, PAGE_SIZE, controller.signal);

      if (!isMountedRef.current || controller.signal.aborted) return;

      setAllPokemons((prev) => {
        // Guarantee no duplicated IDs
        const existingIds = new Set(prev.map((p) => p.id));
        const newItems = page.items.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newItems].sort((a, b) => a.id - b.id);
      });
      setNextOffset(page.nextOffset);
      setTotalCount(page.total);
    } catch (err) {
      if (!isMountedRef.current || controller.signal.aborted) return;

      const serviceError = err as PokemonServiceError;
      if (serviceError.isCancelled) return;

      setLoadMoreError('Falha ao carregar a próxima página.');
    } finally {
      isFetchingMoreRef.current = false;
      if (isMountedRef.current) {
        setIsLoadingMore(false);
      }
    }
  }, [viewMode, isLoadingInitialAll, isRefreshing, nextOffset]);

  // ---------------------------------------------------------------------------
  // Mode toggling
  // ---------------------------------------------------------------------------
  const toggleViewMode = useCallback(() => {
    Keyboard.dismiss();

    if (viewMode === 'search') {
      // Cancel any ongoing search
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
        searchAbortControllerRef.current = null;
      }
      setIsSearching(false);
      setSearchError(null);
      setSearchResult(null);

      setViewMode('all');
      loadInitialAllPokemons();
    } else {
      // Switching back to SEARCH
      if (pageAbortControllerRef.current) {
        pageAbortControllerRef.current.abort();
        pageAbortControllerRef.current = null;
      }
      isFetchingMoreRef.current = false;
      setIsLoadingInitialAll(false);
      setIsLoadingMore(false);
      setAllError(null);
      setLoadMoreError(null);
      setAllPokemons([]);
      setNextOffset(null);

      setViewMode('search');
    }
  }, [viewMode, loadInitialAllPokemons]);

  // ---------------------------------------------------------------------------
  // Pull-to-refresh
  // ---------------------------------------------------------------------------
  const handleRefresh = useCallback(() => {
    if (viewMode === 'search') {
      if (lastSearchedTerm.trim()) {
        executeSearch(lastSearchedTerm, true);
      } else {
        // Nothing to refresh in empty search
        setIsRefreshing(false);
      }
    } else {
      loadInitialAllPokemons(true);
    }
  }, [viewMode, lastSearchedTerm, executeSearch, loadInitialAllPokemons]);

  // ---------------------------------------------------------------------------
  // FlatList rendering & memoized items
  // ---------------------------------------------------------------------------
  const renderItem: ListRenderItem<Pokemon> = useCallback(
    ({ item }) => <PokemonCard pokemon={item} />,
    []
  );

  const keyExtractor = useCallback((item: Pokemon) => item.id.toString(), []);

  // Compute dataset for the single FlatList
  const flatListData = viewMode === 'search' ? (searchResult ? [searchResult] : []) : allPokemons;

  // Footer component
  const renderListFooter = () => {
    if (viewMode === 'all') {
      return (
        <LoadingFooter
          isLoadingMore={isLoadingMore}
          hasReachedEnd={nextOffset === null && allPokemons.length > 0}
          loadMoreError={loadMoreError}
          onRetry={loadMorePokemons}
        />
      );
    }
    return <View style={styles.bottomSpacer} />;
  };

  // Empty state component
  const renderEmptyComponent = () => {
    if (isSearching || isLoadingInitialAll) {
      return (
        <View style={styles.initialLoadingContainer}>
          <ActivityIndicator size="large" color="#E3350D" />
          <Text style={styles.initialLoadingText}>
            {viewMode === 'search'
              ? 'Consultando PokéAPI...'
              : 'Carregando Pokédex...'}
          </Text>
        </View>
      );
    }

    if (viewMode === 'search') {
      if (searchError) {
        return null;
      }
      return (
        <EmptyState
          message="Digite o nome ou ID de um Pokémon para começar."
          subMessage="Exemplos: pikachu, charizard, 25, 150"
        />
      );
    }

    if (viewMode === 'all') {
      if (allError) {
        return null;
      }
      return (
        <EmptyState
          message="Nenhum Pokémon encontrado."
          subMessage="Tente puxar para atualizar a lista."
        />
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      {/* Fixed top header with SearchBar and mode toggle */}
      <View style={styles.headerContainer}>
        <View style={styles.brandingSection}>
          <Text style={styles.appTitle}>PokeSearch</Text>
          <Text style={styles.appSubtitle}>
            Dados em tempo real fornecidos pela PokéAPI
          </Text>
        </View>

        <View style={styles.controlsSection}>
          <SearchBar
            value={searchText}
            onChangeText={setSearchText}
            onSearch={handleSearchSubmit}
            onClear={handleClearSearch}
            isLoading={isSearching}
            disabled={viewMode === 'all'}
          />

          <View style={styles.modeRow}>
            <View style={styles.modeBadge}>
              <Text style={styles.modeBadgeLabel}>Modo:</Text>
              <Text style={styles.modeBadgeValue}>
                {viewMode === 'search' ? 'Busca Individual' : 'Todos os Pokémon'}
              </Text>
            </View>

            <Pressable
              onPress={toggleViewMode}
              accessibilityRole="button"
              accessibilityLabel={
                viewMode === 'search'
                  ? 'Exibir todos os Pokémon'
                  : 'Voltar para busca'
              }
              accessibilityHint={
                viewMode === 'search'
                  ? 'Alterna para a listagem completa paginada da PokéAPI'
                  : 'Retorna para o modo de busca individual'
              }
              style={({ pressed }) => [
                styles.toggleModeButton,
                pressed && styles.toggleModeButtonPressed,
              ]}
            >
              <Text style={styles.toggleModeButtonText}>
                {viewMode === 'search' ? 'Exibir todos' : 'Voltar para busca'}
              </Text>
            </Pressable>
          </View>

          {viewMode === 'all' && (
            <View style={styles.counterRow}>
              <Text style={styles.counterText}>
                {allPokemons.length > 0
                  ? `Exibindo ${allPokemons.length} de ${totalCount} Pokémon`
                  : 'Carregando lista...'}
              </Text>
            </View>
          )}
        </View>

        {/* Global error banners */}
        {viewMode === 'search' && searchError && (
          <ErrorState
            message={searchError}
            onRetry={lastSearchedTerm ? () => executeSearch(lastSearchedTerm) : undefined}
          />
        )}

        {viewMode === 'all' && allError && (
          <ErrorState
            message={allError}
            onRetry={() => loadInitialAllPokemons(false)}
          />
        )}
      </View>

      <FlatList
        data={flatListData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListFooterComponent={renderListFooter}
        ListEmptyComponent={renderEmptyComponent}
        onEndReached={viewMode === 'all' ? loadMorePokemons : undefined}
        onEndReachedThreshold={0.5}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  brandingSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#E3350D',
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
    fontWeight: '500',
  },
  controlsSection: {
    gap: 12,
    marginBottom: 8,
  },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EAEAEA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modeBadgeLabel: {
    fontSize: 12,
    color: '#636366',
    fontWeight: '500',
  },
  modeBadgeValue: {
    fontSize: 12,
    color: '#1C1C1E',
    fontWeight: '700',
  },
  toggleModeButton: {
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toggleModeButtonPressed: {
    opacity: 0.8,
  },
  toggleModeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  counterRow: {
    paddingVertical: 4,
    alignItems: 'center',
  },
  counterText: {
    fontSize: 13,
    color: '#636366',
    fontWeight: '600',
  },
  initialLoadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  initialLoadingText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 16,
  },
});
