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
  const typeStr = params.get("type") || "";
  return {
    search: params.get("search") || "",
    types: typeStr ? typeStr.split(",") : [],
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

  const { search: searchParam, types: typesParam, gen: genParam } = getUrlParams();

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
    const { search: currentSearch, types: currentTypes, gen: currentGen } = getUrlParams();
    if (debouncedSearch !== currentSearch) {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      else {
        if (currentTypes.length > 0) params.set("type", currentTypes.join(","));
        if (currentGen) params.set("generation", currentGen);
      }
      navigate(`/?${params.toString()}`, { replace: true });
    }
  }, [debouncedSearch, navigate]);

  const navigateWithFilters = useCallback(({ types, gen }) => {
    const params = new URLSearchParams();
    if (types && types.length > 0) params.set("type", types.join(","));
    if (gen) params.set("generation", gen);
    navigate(`/?${params.toString()}`, { replace: true });
  }, [navigate]);

  const handleTypeChange = useCallback((type) => {
    setSearchInput("");
    setFilterLoading(true);
    const currentTypes = typesParam;
    let newTypes;
    if (type === "__clear") {
      newTypes = [];
    } else if (currentTypes.includes(type)) {
      newTypes = currentTypes.filter((t) => t !== type);
    } else {
      newTypes = [...currentTypes, type];
    }
    navigateWithFilters({ types: newTypes, gen: genParam });
  }, [typesParam, genParam, navigateWithFilters]);

  const handleGenChange = useCallback((gen) => {
    setSearchInput("");
    setFilterLoading(true);
    const newGen = gen === genParam ? "" : gen;
    navigateWithFilters({ types: typesParam, gen: newGen });
  }, [typesParam, genParam, navigateWithFilters]);

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

  const hasActiveFilters = typesParam.length > 0 || genParam;
  const showLoadMore = hasMore && !searchParam && !hasActiveFilters && pokemonList.length > 0;

  return (
    <div className="home-page">
      <SearchBar value={searchInput} onChange={setSearchInput} />
      <FilterBar
        selectedTypes={typesParam}
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
