import urllib.request
import urllib.error

BASE_URL = 'http://127.0.0.1:8000'

endpoints = {
    'Categories': '/blogs/categories/',
    'Trending': '/blogs/trending/',
    'Top Writers': '/users/top-writers/',
    'Search': '/blogs/search/?q=langchain',
    'Get Blog (slug)': '/blogs/langchain-and-rag-building-ai-application'
}

print("Testing Public Endpoints...")
for name, path in endpoints.items():
    try:
        req = urllib.request.Request(f"{BASE_URL}{path}")
        with urllib.request.urlopen(req) as response:
            print(f"{name}: {response.getcode()}")
    except urllib.error.HTTPError as e:
        print(f"{name}: {e.code} -> {e.read().decode()[:200]}")
    except Exception as e:
        print(f"{name}: Failed -> {e}")

