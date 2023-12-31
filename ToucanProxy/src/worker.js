/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// See: https://developers.cloudflare.com/workers/examples/cors-header-proxy/

/*
TODO: Lock down however possible here. Only allow origin to ToucanReader URL, in prod mode.
Configure with env-var for that.
Prevent: localhost, special addresses, to self, etc.
See what cors-anywhere does about forwarding Authentication.
*/

// The endpoint you want the CORS reverse proxy to be on
const PROXY_ENDPOINT = "/corsproxy/";

async function handleProxyRequest(request) {
  const reqUrl = new URL(request.url);
  let apiUrlStr = reqUrl.searchParams.get("apiurl");
  if (apiUrlStr === null) {
    console.log("Error: no apiurl param");
    return new Response(null, {
      status: 400,
      statusText: "Bad URL. Must specify apiurl param to corsproxy",
    });
  }
  let apiUrl = new URL(apiUrlStr);
  let apiRequest = new Request(apiUrl, request);
  apiRequest.headers.set("Origin", apiUrl.origin);
	// TODO - do not follow too many redirects
	// TODO - prevent infinite loops
  let response = await fetch(apiRequest, {redirect: 'follow'});

  // Handle a single redirect
  if (!response.ok && (300 <= response.status && response.status < 399)) {
    //console.log("Response url: " + response.url);
    // let newUrl = response.headers.get("Location");
    let newUrl = response.url;
    console.log("Handling redirect. Orig url: " + apiUrlStr + " New url: " + newUrl);
    response = await fetch(newUrl, request);
  }
  if (!response.ok) {
    console.log("Response error: " + response.statusText);
    return new Response(null, {
      status: 400,
      statusText: `Server responded with error (${apiUrlStr}): ${response.status} ${response.statusText}`,
    });
  }

  // Recreate the response so you can modify the headers
  response = new Response(response.body, response);
  // TODO - restrict reqOrigin properly
  const reqOrigin = request.headers.get("Origin");
  response.headers.set("Access-Control-Allow-Origin", reqOrigin);
  // Append to/Add Vary header so browser will cache response correctly
  response.headers.append("Vary", "Origin");
  return response;
}

async function handleOptionsRequest(request) {
  if (
    request.headers.get("Origin") !== null &&
    request.headers.get("Access-Control-Request-Method") !== null &&
    request.headers.get("Access-Control-Request-Headers") !== null
  ) {
    // Handle CORS preflight requests.
    // TODO - restrict to correct origin
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
        "Access-Control-Max-Age": "86400",
        "Access-Control-Allow-Headers": request.headers.get(
          "Access-Control-Request-Headers"
        ),
      },
    });
  } else {
    // Handle standard OPTIONS request.
    return new Response(null, {
      headers: {
        Allow: "GET, HEAD, POST, OPTIONS",
      },
    });
  }
}

function makeTestResponse(msg) {
  return new Response("<p>"+msg+"</p>", {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
  });
}

function makeBasicHtmlResponse(request) {
  const html = `<!DOCTYPE html>
  <body>
    <h1>Hello World</h1>
    <p>This markup was generated by a Cloudflare Worker.</p>
  </body>`;

  const reqOrigin = request.headers.get("Origin");
  return new Response(html, {
    headers: {
      "content-type": "text/html;charset=UTF-8",
      "Access-Control-Allow-Origin": reqOrigin,
    },
  });
}

async function handleRequest(request) {
  const url = new URL(request.url);
  if (url.pathname.startsWith(PROXY_ENDPOINT)) {
    if (request.method === "OPTIONS") {
      // Handle CORS preflight requests
      console.log("Handling preflight req");
      return await handleOptionsRequest(request);
    } else if (
      request.method === "GET" ||
      request.method === "HEAD" ||
      request.method === "POST"
    ) {
      console.log("Handling proxy request");
      return await handleProxyRequest(request);
    } else {
      return new Response(null, {
        status: 405,
        statusText: "Method Not Allowed",
      });
    }
  } else {
    return new Response(null, {
      status: 400,
      statusText: "Not a valid url path",
    });
  }
}

/*
export default {
  async fetch(request) {
    return makeBasicHtmlResponse(request);
  }
};
*/

export default {
  async fetch(request) {
    console.log("Handling request: "+request.url);
    try {
      return await handleRequest(request);
    } catch (error) {
      console.log("Server exception: (rethrowing)");
      console.log(error);
      throw(error);
    }
  },
};

