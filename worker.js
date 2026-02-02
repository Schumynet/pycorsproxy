importScripts("https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js");

// URL RAW del tuo file Python su GitHub
const PYTHON_URL = "https://raw.githubusercontent.com/schumynet/pycorsproxy/main/python_code.py";

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

    // Carica il codice Python da GitHub RAW
    const pythonCode = await (await fetch(PYTHON_URL)).text();
    await pyodide.runPythonAsync(pythonCode);

    // Esegui la funzione Python
    const [data, headers] = await pyodide.runPythonAsync(
      `await proxy("${url}")`
    );

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": headers["content-type"] || "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      }
    });
  }
};