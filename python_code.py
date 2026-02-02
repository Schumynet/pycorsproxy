import js
from pyodide.http import pyfetch

async def proxy(url):
    r = await pyfetch(url, method="GET")
    data = await r.bytes()
    headers = dict(r.headers)
    return data, headers