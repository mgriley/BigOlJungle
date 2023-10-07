
export let introDocs = [
];

export let basicExample = [
];

export let functionDocs = [
  {
    name: "Main",
    funcs: [
      {
        sig: "updateFeed(feedUrl)",
        desc: `
        You implement this function! It is called with the user-entered feedUrl as a str, and must return
        a FeedUpdate struct with the updated feed data (or abort with a descriptive error).
        `,
        ex: `
function updateFeed(feedUrl) {
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
        sig: "log(str)",
        ex: `log("Hello World");`,
        desc: `Log a string to the browser dev console.`
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
        ex: `let text = fetch("https://news.ycombinator.com")`,
      }
    ]
  }
]

