
export let introDocs = [
];

export let basicExample = [
];

export let functionDocs = [
  {
    name: "Main",
    funcs: [
      {
        sig: "updateFeed(feedUrl, customOptions)",
        desc: `
        You implement this function! It is called with the user-entered feedUrl str and a dict
        of any user-entered custom options. You must return
        a FeedUpdate struct with the updated feed data (or abort with a descriptive error).
        `,
        ex: `
function updateFeed(feedUrl, customOptions) {
  let text = fetchText(feedUrl);

  // Do some parsing of the text...

  // Return the new links
  return [
    {
      title: "Some title",
      description: "Something happened", // Optional
      link: "https://somepage.com/thearticle", // Optional,
      pubDate: "Thu, 20 Dec 2022 02:46:11 UTC", // Optional. Date in pubDate format
      extraDataString: "99 points", // Optional
    },
    ...
  ];
}
`
      }
    ]
  },
  {
    name: "Basic",
    funcs: [
      {
        sig: "abort(errMsg)",
        desc: "Abort the script. The user will be shown the given error msg on the feed.",
        ex: `abort("Failed to parse things!");`
      },
    ]
  },
  {
    name: "Fetch",
    funcs: [
      {
        sig: ["fetchText(urlStr)", "fetchText(urlStr, options)"],
        desc: "Fetches a remote text resource, such as a HTML page. " + 
          "Returns the text as a string if the fetch succeeds, otherwise aborts." +
          " `options` is an object containing any custom settings for the request. " +
          " See: https://developer.mozilla.org/en-US/docs/Web/API/fetch",
        ex: `
// Simple fetch:
var text = fetchText("https://news.ycombinator.com")
var obj = parseHtml(text);
logJs(obj);
...

// Fetch with options:
var text = fetchText("https://someapi.com/users", {
  method: "GET",
  headers: {
    Authorization: "Bearer " + myToken,
    "Content-Type": "application/json",
  },
  body: stringify(bodyObj)
}); 
...
`,
      }
    ]
  },
  {
    name: "Utils",
    funcs: [
      {
        sig: "log(str)",
        desc: `Log a string to the browser dev console.`,
        ex: `log("Hello World");`,
      },
      {
        sig: "logJs(obj)",
        desc: "Pretty print a js object",
        ex: `logJs({"hello": "world"})`
      },
      {
        sig: "logJson(jsonStr)",
        desc: "Pretty print a JSON string",
        ex: `logJson("{\\"hello\\": \\"world\\"}")`
      },
      {
        sig: "logXml(xmlStr)",
        desc: "Pretty print a XML (including HTML) string",
        ex: `logXml("<html><body><p>Hello World</p></body></html>")`
      },
      {
        sig: "stringify(obj)",
        desc: `Converts a js object to a string (like JSON.stringify).`,
        ex: `var str = stringify({"hello": "world"})`,
      },
      {
        sig: "parseJson(jsonStr)",
        desc: `Parses a JSON string to a js object (like JSON.parse).`,
        ex: `var obj = parseJson("{\\"hello\\": \\"world\\"}");`
      },
      {
        sig: "parseHtml(htmlStr)",
        desc: `Parses a HTML string to a js object.`,
        ex: `var obj = parseHtml("<html><body><p>Hello World</p></body></html>");`
      },
      {
        sig: "parseXml(xmlStr)",
        desc: `Parses a XML string to a js object.`,
        ex: `var obj = parseXml("<doc><elem>Some elem</elem></doc>")`,
      }
    ]
  },
  {
    name: "MoreInfo",
    funcs: [
      {
        sig: "More...",
        blockDesc: `The interpreter also supports the following JS APIs:
- Array
- String
- Boolean
- Number
- Date
- RegExp
- Error
- Math
- JSON`
      }
    ]
  },
]

