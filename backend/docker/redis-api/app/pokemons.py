"""
This is a module for fetching and processing Pokémon data from an external API.
It uses the requests library to make HTTP requests and the json library to handle JSON data.
"""

import requests
import json
import redis
from db import Database
from typing import Optional, TypedDict
import time
import os
import unicodedata

class PokemonLight(TypedDict):
    id: int
    url: str
    name: str
    icon: str
    officialArtwork: str
    
class PokemonSpecies(TypedDict):
    name: str
    url: str
    
class PokemonFull(PokemonLight):
    height: int
    weight: int
    species: PokemonSpecies
    eggsGroups: list[str]
    abilities: list[str]
    types: str
    evolutions: list[PokemonLight]
    
    


POKEAPI_BASE_URL = "https://pokeapi.co/api/v2"

def fetch_pokemons(limit=20, offset=0):
    """
    Fetch a list of Pokémon from the PokeAPI.

    Args:
        limit (int): The number of Pokémon to fetch.
        offset (int): The starting point for fetching Pokémon.

    Returns:
        list: A list of dictionaries containing Pokémon data.
    """
    url = f"{POKEAPI_BASE_URL}/pokemon?limit={limit}&offset={offset}"
    response = requests.get(url)
    
    if response.status_code != 200:
        raise Exception(f"Error fetching data from PokeAPI: {response.status_code}")
    
    data = response.json()
    return data.get('results', [])

def retrieve_pokemons_from_cache(redis_connection: redis.Redis, limit=20, offset=0):
    """
    Retrieve Pokémon data from Redis cache.

    Args:
        redis_connection (redis.Redis): The Redis connection object.
        limit (int): The number of Pokémon to fetch.
        offset (int): The starting point for fetching Pokémon.

    Returns:
        list: A list of dictionaries containing Pokémon data from cache or API.
    """
    ids = [str(i) for i in range(offset, offset + limit)]
    
    # If cache miss, raise an exception
    keys = [f"pokemon:{i}:light" for i in ids]
    values = redis_connection.mget(keys)
    
    pokemons = []
    for value in values:
        if value:
            pokemons.append(json.loads(value))
        else:
            raise Exception(f"Cache miss: Missing data for pokemon with key {keys[values.index(value)]}")
    
    return pokemons

def get_cached_pokemon(key: str) -> Optional[dict]:
    try:
        cached = Database().get_connection().get(key)
        return json.loads(cached) if cached else None
    except Exception as e:
        raise Exception(f"Error getting cached Pokémon data: {str(e)}")


def cache_full_pokemon(redis_connection: redis.Redis, pokemon_data: dict):
    """
    Cache full Pokémon data in Redis.

    Args:
        redis_connection (redis.Redis): The Redis connection object.
        pokemon_data (dict): The Pokémon data to cache.
    """
    formatted_data = json.dumps(pokemon_data)
    try:
        redis_connection.set(f"pokemon:{pokemon_data['id']}:full", formatted_data, ex=3600)  # Cache for 1 hour
    except Exception as e:
        raise Exception(f"Error caching full Pokémon data: {str(e)}")

    
def cache_light_pokemon(redis_connection: redis.Redis, pokemon_data: PokemonLight):
    """
    Cache light Pokémon data in Redis.

    Args:
        redis_connection (redis.Redis): The Redis connection object.
        pokemon_data (dict): The Pokémon data to cache.
    """
    formatted_data = json.dumps(pokemon_data)
    try:
        redis_connection.set(f"pokemon:{pokemon_data['id']}:light", formatted_data, ex=3600)  # Cache for 1 hour
    except Exception as e:
        raise Exception(f"Error caching light Pokémon data: {str(e)}")


# --------- Helpers HTTP y formateo ---------

def _http_get_json(url: str, retries: int = 3, backoff: float = 0.5) -> dict:
    last_exc = None
    for attempt in range(retries):
        try:
            resp = requests.get(url, timeout=10)
            if resp.status_code == 200:
                return resp.json()
            else:
                raise Exception(f"HTTP {resp.status_code} GET {url}")
        except Exception as e:
            last_exc = e
            time.sleep(backoff * (attempt + 1))
    raise Exception(f"Fallo al obtener {url}: {last_exc}")

def _build_light_from_detail(detail: dict) -> PokemonLight:
    return {
        "id": detail["id"],
        "name": detail["name"],
        "url": f"{POKEAPI_BASE_URL}/pokemon/{detail['id']}",
        "icon": detail["sprites"]["front_default"],
        "officialArtwork": detail["sprites"]["other"]["official-artwork"]["front_default"],
    }

def _extract_types(detail: dict) -> list[str]:
    return [t["type"]["name"] for t in detail.get("types", [])]

def _extract_abilities(detail: dict) -> list[str]:
    return [a["ability"]["name"] for a in detail.get("abilities", [])]

# --------- Lectura / escritura cache centralizadas ---------

def _get_cached_light(redis_connection: redis.Redis, pid: int) -> Optional[PokemonLight]:
    raw = redis_connection.get(f"pokemon:{pid}:light")
    return json.loads(raw) if raw else None

def _get_cached_full(redis_connection: redis.Redis, pid: int) -> Optional[PokemonFull]:
    raw = redis_connection.get(f"pokemon:{pid}:full")
    return json.loads(raw) if raw else None

# --------- Funciones equivalentes a service.ts ---------

def fetch_pokemon_by_id(redis_connection: redis.Redis, pid: int) -> PokemonLight:
    if pid < 1:
        raise ValueError("ID debe ser positivo")
    cached = _get_cached_light(redis_connection, pid)
    if cached:
        return cached
    detail = _http_get_json(f"{POKEAPI_BASE_URL}/pokemon/{pid}")
    light = _build_light_from_detail(detail)
    cache_light_pokemon(redis_connection, light)
    return light

def fetch_pokemons_by_ids(redis_connection: redis.Redis, ids: list[int]) -> list[PokemonLight]:
    if not ids:
        raise ValueError("Lista de IDs vacía")
    result: list[PokemonLight] = []
    missing: list[int] = []
    # Primero intentar cache masiva
    for pid in ids:
        cached = _get_cached_light(redis_connection, pid)
        if cached:
            result.append(cached)
        else:
            missing.append(pid)
    for pid in missing:
        result.append(fetch_pokemon_by_id(redis_connection, pid))
    # Mantener orden según ids
    ordered = {p["id"]: p for p in result}
    return [ordered[i] for i in ids if i in ordered]

def fetch_pokemon_by_url(redis_connection: redis.Redis, url: str) -> PokemonFull:
    # La URL esperada: https://pokeapi.co/api/v2/pokemon/{id}
    if not url.startswith(f"{POKEAPI_BASE_URL}/pokemon/"):
        raise ValueError("URL inválida para Pokémon")
    try:
        pid = int(url.rstrip("/").split("/")[-1])
    except Exception:
        raise ValueError("No se pudo extraer ID de la URL")
    cached_full = _get_cached_full(redis_connection, pid)
    if cached_full:
        return cached_full
    detail = _http_get_json(url)
    # Evoluciones + egg groups desde species
    evo_and_eggs = fetch_pokemon_evolutions_and_egg_groups(redis_connection, detail["species"]["url"])
    full: PokemonFull = {
        "id": detail["id"],
        "name": detail["name"],
        "url": url,
        "icon": detail["sprites"]["front_default"],
        "officialArtwork": detail["sprites"]["other"]["official-artwork"]["front_default"],
        "height": detail["height"],
        "weight": detail["weight"],
        "species": {
            "name": detail["species"]["name"],
            "url": detail["species"]["url"],
        },
        "eggsGroups": evo_and_eggs["eggGroups"],
        "abilities": _extract_abilities(detail),
        # En tu TypedDict types es str; aquí concateno. Cambia a list[str] si ajustas el tipo.
        "types": ",".join(_extract_types(detail)),
        "evolutions": evo_and_eggs["evolutions"],
    }
    cache_full_pokemon(redis_connection, full)
    # Asegurar también el light
    if not _get_cached_light(redis_connection, pid):
        cache_light_pokemon(redis_connection, _build_light_from_detail(detail))
    return full

def fetch_pokemon_basic_list(redis_connection: redis.Redis, limit=20, offset=0) -> list[PokemonLight]:
    """
    Similar a fetchPokemons en TS: obtiene lista (light). Usa cache individual.
    """
    base_list = fetch_pokemons(limit=limit, offset=offset)  # ya devuelve name/url
    lights: list[PokemonLight] = []
    for item in base_list:
        # extraer id desde URL de la API
        try:
            pid = int(item["url"].rstrip("/").split("/")[-1])
        except Exception:
            continue
        cached = _get_cached_light(redis_connection, pid)
        if cached:
            lights.append(cached)
            continue
        detail = _http_get_json(item["url"])
        light = _build_light_from_detail(detail)
        cache_light_pokemon(redis_connection, light)
        lights.append(light)
    return lights

# --------- Evoluciones y Egg Groups ---------

def fetch_pokemon_evolutions_and_egg_groups(redis_connection: redis.Redis, species_url: str) -> dict:
    """
    Devuelve {"evolutions": list[PokemonLight], "eggGroups": list[str]}
    """
    species = _http_get_json(species_url)
    egg_groups = [g["name"] for g in species.get("egg_groups", [])]
    evo_chain_url = species["evolution_chain"]["url"]
    evolutions = fetch_evolution_chain(redis_connection, evo_chain_url)
    return {
        "evolutions": evolutions,
        "eggGroups": egg_groups,
    }

def fetch_evolution_chain(redis_connection: redis.Redis, chain_url: str) -> list[PokemonLight]:
    chain = _http_get_json(chain_url)
    evolutions: list[PokemonLight] = []
    def _traverse(node: dict):
        if not node:
            return
        species_name = node["species"]["name"]
        species_url = node["species"]["url"]
        try:
            pid = int(species_url.rstrip("/").split("/")[-1])
        except Exception:
            pid = None
        if pid:
            evolutions.append(fetch_pokemon_by_id(redis_connection, pid))
        for nxt in node.get("evolves_to", []):
            _traverse(nxt)
    _traverse(chain["chain"])
    # eliminar duplicados conservando orden
    seen = set()
    unique: list[PokemonLight] = []
    for p in evolutions:
        if p["id"] not in seen:
            seen.add(p["id"])
            unique.append(p)
    return unique

# --------- Endpoint oriented helpers (opcional) ---------

def get_full_pokemon(redis_connection: redis.Redis, pid: int) -> PokemonFull:
    url = f"{POKEAPI_BASE_URL}/pokemon/{pid}"
    return fetch_pokemon_by_url(redis_connection, url)


def _load_search_index() -> dict[str, int]:
    """
    Carga y cachea el índice (name -> id) desde el json.
    """
    path = os.path.join(os.path.dirname(__file__), "search_pokemons.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def _normalize(txt: str) -> str:
    txt = txt.lower()
    txt = unicodedata.normalize("NFD", txt)
    txt = "".join(c for c in txt if unicodedata.category(c) != "Mn")
    # Reemplazar separadores por espacio y colapsar
    out = []
    last_space = False
    for c in txt:
        if c.isalnum():
            out.append(c)
            last_space = False
        else:
            if not last_space:
                out.append(" ")
                last_space = True
    return " ".join("".join(out).split())

def _levenshtein(a: str, b: str, max_distance: int | None = None) -> int:
    """
    Distancia Levenshtein iterativa con poda opcional (early exit).
    """
    if a == b:
        return 0
    la, lb = len(a), len(b)
    if la == 0:
        return lb
    if lb == 0:
        return la
    if la > lb:
        a, b = b, a
        la, lb = lb, la
    prev = list(range(la + 1))
    for j in range(1, lb + 1):
        cur = [j] + [0] * la
        bj = b[j - 1]
        # Rango de poda
        min_row = float("inf")
        for i in range(1, la + 1):
            cost = 0 if a[i - 1] == bj else 1
            cur[i] = min(
                prev[i] + 1,      # eliminación
                cur[i - 1] + 1,   # inserción
                prev[i - 1] + cost  # sustitución
            )
            if cur[i] < min_row:
                min_row = cur[i]
        prev = cur
        if max_distance is not None and min_row > max_distance:
            return max_distance + 1
    return prev[la]

def _similarity(a: str, b: str) -> float:
    """
    Similitud normalizada basada en Levenshtein.
    """
    if not a or not b:
        return 0.0
    dist = _levenshtein(a, b, max_distance=max(len(a), len(b)))
    return 1.0 - dist / max(len(a), len(b))

def _score(query_norm: str, candidate_norm: str, original_candidate: str) -> float:
    """
    Calcula un score heurístico:
    - match exacto
    - prefijo
    - substring
    - similitud difusa
    - cobertura de tokens
    """
    if not candidate_norm:
        return 0.0
    score = 0.0
    if candidate_norm == query_norm:
        score += 1000
    if candidate_norm.startswith(query_norm):
        score += 800 * (len(query_norm) / max(len(candidate_norm), 1))
    # Substring
    if query_norm in candidate_norm and not candidate_norm.startswith(query_norm):
        pos = candidate_norm.find(query_norm)
        penalty = pos * 5
        score += max(600 - penalty, 100)
    # Tokens
    q_tokens = set(query_norm.split())
    c_tokens = set(candidate_norm.split())
    if q_tokens:
        overlap = len(q_tokens & c_tokens) / len(q_tokens)
        score += overlap * 400
    # Fuzzy completo
    sim = _similarity(query_norm, candidate_norm)
    score += sim * 300
    # Bonus por proximidad de longitud (evita que nombres muy largos dominen)
    length_ratio = min(len(candidate_norm), len(query_norm)) / max(len(candidate_norm), len(query_norm))
    score += length_ratio * 50
    return score

def search_pokemon_by_name(redis_connection: redis.Redis, query: str, limit: int = 10) -> list[PokemonLight]:
    """
    Búsqueda "fulltext" heurística sobre nombres:
    - Normaliza (lower, sin acentos, separadores)
    - Ranking por varios criterios.
    Retorna lista de PokemonLight ordenados por relevancia.
    """
    query = (query or "").strip()
    if not query:
        return []
    index = _load_search_index()
    query_norm = _normalize(query)
    scored: list[tuple[float, str, int]] = []
    for name, pid in index.items():
        norm = _normalize(name)
        score = _score(query_norm, norm, name)
        if score > 0:
            scored.append((score, name, pid))
    if not scored:
        return []
    scored.sort(key=lambda x: (-x[0], x[1]))  # score desc, nombre asc para estabilidad
    results: list[PokemonLight] = []
    for _, name, pid in scored[:limit]:
        # intentar cache; si no, fetch
        cached = _get_cached_light(redis_connection, pid)
        if cached:
            results.append(cached)
        else:
            try:
                results.append(fetch_pokemon_by_id(redis_connection, pid))
            except Exception:
                # Si falla la API, al menos entregar un light mínimo
                results.append({
                    "id": pid,
                    "name": name,
                    "url": f"{POKEAPI_BASE_URL}/pokemon/{pid}",
                    "icon": "",
                    "officialArtwork": "",
                })
    return results