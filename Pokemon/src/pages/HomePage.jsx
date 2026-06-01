import { useState, useEffect, useCallback, useRef } from "react";
import { useLoaderData, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useDebounce } from "../hooks/useDebounce";
import { useI18n } from "../hooks/useI18n.jsx";
import { getPokemonList } from "../api/pokemonApi";
import SearchBar from "../components/SearchBar";
import PokemonGrid from "../components/PokemonGrid";
import FilterBar from "../components/FilterBar";
import LoadMore from "../components/LoadMore";
import { PAGE_LIMIT } from "../utils/constants";
import "../styles/home.css";

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    search: params.get("search") || "",
    type: params.get("type") || "",
    gen: params.get("generation") || "",
  };
}

export default function HomePage() {
  const initialData = useLoaderData();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [pokemonList, setPokemonList] = useState(initialData.pokemon || []);
  const [hasMore, setHasMore] = useState(initialData.hasMore || false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const initialDataSet = useRef(false);

  const { search: searchParam, type: typeParam, gen: genParam } = getUrlParams();

  const [searchInput, setSearchInput] = useState(searchParam);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    if (!initialDataSet.current) {
      initialDataSet.current = true;
      setFilterLoading(false);
      return;
    }
    setPokemonList(initialData.pokemon || []);
    setHasMore(initialData.hasMore || false);
    setFilterLoading(false);
  }, [initialData]);

  useEffect(() => {
    const { search: currentSearch } = getUrlParams();
    if (debouncedSearch !== currentSearch) {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      navigate(`/?${params.toString()}`, { replace: true });
    }
  }, [debouncedSearch, navigate]);

  const buildFilterUrl = useCallback(({ type, gen }) => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (gen) params.set("generation", gen);
    return `/?${params.toString()}`;
  }, []);

  const handleTypeChange = useCallback((type) => {
    setSearchInput("");
    setFilterLoading(true);
    const newGen = type === typeParam ? "" : genParam;
    navigate(buildFilterUrl({ type: type === typeParam ? "" : type, gen: newGen }), { replace: true });
  }, [buildFilterUrl, typeParam, genParam, navigate]);

  const handleGenChange = useCallback((gen) => {
    setSearchInput("");
    setFilterLoading(true);
    const newType = gen === genParam ? "" : typeParam;
    navigate(buildFilterUrl({ type: newType, gen: gen === genParam ? "" : gen }), { replace: true });
  }, [buildFilterUrl, typeParam, genParam, navigate]);

  const handleClearFilters = useCallback(() => {
    setSearchInput("");
    setFilterLoading(true);
    navigate("/", { replace: true });
  }, [navigate]);

  const handleLoadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const offset = pokemonList.length;
      const data = await getPokemonList({ limit: PAGE_LIMIT, offset });
      setPokemonList((prev) => [...prev, ...(data.pokemon || [])]);
      setHasMore(data.hasMore);
    } catch {
      toast.error(t("error.fetch"));
    } finally {
      setLoadingMore(false);
    }
  }, [pokemonList.length, t]);

  const hasActiveFilters = typeParam || genParam;
  const showLoadMore = hasMore && !searchParam && !hasActiveFilters && pokemonList.length > 0;

  return (
    <div className="home-page">
      <SearchBar value={searchInput} onChange={setSearchInput} />
      <FilterBar
        selectedType={typeParam}
        selectedGen={genParam}
        onTypeChange={handleTypeChange}
        onGenChange={handleGenChange}
        onClear={handleClearFilters}
      />
      {!filterLoading && pokemonList.length > 0 && (
        <div className="grid-counter">
          <span>{pokemonList.length} / {initialData.total || "?"}</span>
        </div>
      )}
      <PokemonGrid
        pokemon={pokemonList}
        loading={filterLoading}
        search={searchParam}
      />
      {showLoadMore && (
        <LoadMore onClick={handleLoadMore} loading={loadingMore} hasMore={hasMore} />
      )}
    </div>
  );
}
