# BigOlJungle

BigOlJungle contains a collection of open-source web projects. Please see the sub-directories for project-specific READMEs.

Projects:

- JungleReader: Feed-reader webapp. Read whatever you like, across the web.
- JungleWriter: [WIP] Website-builder webapp. Create your own website with a feed, files, and blog without leaving the browser.
- JungleNode: [WIP] Coming soon ;)
- JungleExt: A web-extension that is required by JungleReader, for making cross-domain web requests.

Other:

- ToucanProxy: CORs proxy built on CloudFlare Workers. Only used for development.

# JungleReader

JungleReader is a free + open-source feed reader.

- Try it here: https://www.zajungle.com
- GIF of it in action: https://mastodon.social/@mriley/111619998502052493

Some Pros:

- Builtin support for RSS, Mastodon, YouTube, and Reddit
- It can "follow" blogs with no RSS support by detecting page changes
- Free + open-source under AGPL license.
- All your data is stored locally.
- Custom plugin support: Write custom scripts to parse websites that don't support RSS. They run locally in a sandbox within the web-app.

Some Cons:

- Requires a browser extension (required so that the webapp can fetch external content)
- No mobile support yet
- No Twitter support yet
- No image/gif support yet
- Does not show the full article text in the app (instead links you to the source)

