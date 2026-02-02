importScripts("https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js");

let pyodideReady = loadPyodide({
  indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
});

export default {
  async fetch(request) {
    const url = new URL(request.url).searchParams.get("url");
    if (!url) {
      return new Response("Missing ?url=", { status: 400 });
    }

    const pyodide = await pyodideReady;

    const pythonCode = `
import js
from pyodide.http import pyfetch

async def do_request(url):
    r = await pyfetch(url, method="GET")
    data = await r.bytes()
    headers = dict(r.headers)
    return data, headers
`;

    await pyodide.runPythonAsync(pythonCode);

    const [data, headers] = await pyodide.runPythonAsync(
      `await do_request("${url}")`
    );

    const resp = new Response(data, {
      status: 200,
      headers: {
        "Content-Type": headers["content-type"] || "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      }
    });

    return resp;
  }
};