from flask import Flask
from flask_cors import CORS
import redis
import json
from pokemons import fetch_pokemons, fetch_pokemon_basic_list, get_full_pokemon, search_pokemon_by_name
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
import time
from db import Database                      
from flask import request        

# --- Métricas ---
REQUEST_COUNT = Counter(
    'flask_http_requests_total', 
    'Total de requests HTTP',
    ['method', 'endpoint', 'http_status']
)

REQUEST_LATENCY = Histogram(
    'flask_http_request_duration_seconds',
    'Latencia de requests HTTP',
    ['method', 'endpoint']
)       



    

app = Flask(__name__)
CORS(app)

@app.before_request
def start_timer():
    request.start_time = time.time()

@app.after_request
def record_metrics(response):
    resp_time = time.time() - request.start_time
    REQUEST_LATENCY.labels(request.method, request.path).observe(resp_time)
    REQUEST_COUNT.labels(request.method, request.path, response.status_code).inc()
    return response

@app.route("/metrics")
def metrics():
    return generate_latest(), 200, {'Content-Type': CONTENT_TYPE_LATEST}

@app.route('/cache-test', methods=['GET'])
def cache_test():
    try:
        r = Database().get_connection()
        r.set('test_key', 'Hello, Redis!')
        value = r.get('test_key')
        if value:
            return {'message': 'Cache is working!', 'value': value}, 200
        else:
            return {'message': 'Cache is not working!'}, 500
    except Exception as e:
        return {'error': str(e)}, 500
    
@app.route('/pokemons', methods=['GET'])
def get_pokemons():
    try:
        r = Database().get_connection()
        cached_pokemons = r.get('pokemons')
        
        if cached_pokemons:
            pokemons = json.loads(cached_pokemons)
            return {'source': 'cache', 'data': pokemons}, 200
        
        pokemons = fetch_pokemons(limit=20, offset=0)
        r.set('pokemons', json.dumps(pokemons), ex=300)  # Cache for 5 minutes
        return {'source': 'api', 'data': pokemons}, 200
    except Exception as e:
        return {'error': str(e)}, 500
    
@app.route('/getListPokemon', methods=['GET'])
def get_list_pokemon():
    try:
        limit = request.args.get('limit', default=20, type=int)
        offset = request.args.get('offset', default=0, type=int)
        if limit < 1 or offset < 0:
            return {'error': 'Parámetros inválidos'}, 400
        r = Database().get_connection()
        cache_key = f"pokemon:list:{limit}:{offset}"
        cached = r.get(cache_key)
        if cached:
            return {'source': 'cache', 'data': json.loads(cached)}, 200
        data = fetch_pokemon_basic_list(r, limit=limit, offset=offset)
        r.set(cache_key, json.dumps(data), ex=300)
        return {'source': 'api', 'data': data}, 200
    except Exception as e:
        return {'error': str(e)}, 500

@app.route('/getPokemon/<int:pid>', methods=['GET'])
def get_pokemon(pid: int):
    try:
        if pid < 1:
            return {'error': 'ID inválido'}, 400
        r = Database().get_connection()
        cached_full = r.get(f"pokemon:{pid}:full")
        data = get_full_pokemon(r, pid)
        source = 'cache' if cached_full else 'api'
        return {'source': source, 'data': data}, 200
    except ValueError as ve:
        return {'error': str(ve)}, 400
    except Exception as e:
        return {'error': str(e)}, 500
    

@app.route('/searchPokemon/<name>', methods=['GET'])
def search_pokemon(name: str):
    try:
        if not name:
            return {'error': 'Nombre inválido'}, 400
        r = Database().get_connection()
        data = search_pokemon_by_name(r, name)
        if not data:
            return {'error': 'Pokémon no encontrado'}, 404
        return {'data': data}, 200
    except Exception as e:
        return {'error': str(e)}, 500

    
if __name__ == '__main__':
    # Se ejecuta el servidor Flask en el puerto 5000, en docker se mapea al puerto 5000
    app.run(host='0.0.0.0', port=5000, debug=False)