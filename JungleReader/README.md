# JungleReader

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### JS-Interpreter Notes

Note that acorn_interpreter.js doesn't expose all of the required functions. For now, serve the full acorn.js and interpreter.js. Will have to minify these later.

## Tooling Notes

Uses postcss with postcss-preset-env to allow using new css syntax. Converts to plain/old CSS for browsers that don't support it. See the npm page for postcss-preset-env. It reads the "browserslist" key in package.json.

## Articles/Info

Articles on how to setup the domain properly in namecheap and Cloudflare Pages:
- https://www.bigcartel.com/resources/help/article/namecheap
- https://www.namecheap.com/support/knowledgebase/article.aspx/9604/2237/types-of-domain-redirects-301-302-url-redirects-url-frame-and-cname/

## Assets

Small chameleon svg (CC0 license):
https://www.svgrepo.com/svg/170979/chameleon

