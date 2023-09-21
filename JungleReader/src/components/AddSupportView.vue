<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FetchMethod, FeedGroup, Feed } from '../State.js'
import ButtonGenerator from './ButtonGenerator.vue'

let rssTemplate = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">

<channel>
  <title>My Website</title>
  <link>https://www.mywebsite.com</link>
  <description>This is a website where I share cat photos.</description>
  <item>
    <title>Post 1 - Cats Eating</title>
    <link>https://www.mywebsite.com/posts/cats-eating</link>
    <description>See pictures of cats eating</description>
    <pubDate>Fri, 1 Sept 2023</pubDate>
  </item>
  <item>
    <title>Post 2 - Cats Sleeping</title>
    <link>https://www.mywebsite.com/posts/cats-sleeping</link>
    <description>See pictures of cats sleeping</description>
    <pubDate>Sat, 2 Sept 2023</pubDate>
  </item>
</channel>

</rss> 
`

</script>

<template>
  <div class="AddSupport">
    <h1 class="PageHeader">Add Support</h1>
    <p><b>Want to add JungleReader support to your own website (or someone else's)? Follow this guide.</b></p>
    <p>
    The best and easiest way to make your site readable on JungleReader is to add a RSS feed to your site. A RSS feed is
    a simple HTML-like file that lists the posts on your website and gives links to them. You can see a sample one below.
    You simply make this
    file available at your website, like at "https://www.yoursite.com/feed.rss". JungleReader and many other
    RSS apps use this link to add the feed.
    </p>
    <p>
    If you made your website using a website-builder/generator tool like WordPress, Wix, Hugo, Jekyll, etc.
    then typically there will be a plugin available to automatically generate a RSS file for your blog/posts.
    </p>
    <p>
    Fortunately, RSS files are very simple, so if no plugin is available, you can easily hand-write one (or generate it with a script). The downside is that you'll
    have to manually update it whenever your site makes a new post.

    You can use this template to get you started:
    </p>
    <p class="CodeBlock">{{ rssTemplate }}</p>
    <p>More info on RSS: <a href="https://www.w3schools.com/xml/xml_rss.asp">https://www.w3schools.com/xml/xml_rss.asp</a></p>
    <p>
    Once you have your RSS feed, you can create a "www.junglereader.com/#/addfeed/..." link that, once clicked, will take the user to their JungleReader page
    and prompt to add the feed. To generate this link, use the Button Generator form below.
    </p>
    <h4>Other Options</h4>
    <p>
    Another option is to write and host a custom plugin for your site. Consider this option when you want your feed to update automatically and
    cannot generate the RSS file easily. Basically, a custom plugin is a small script that knows how to take the HTML page of a site and generate a feed.
    To write one, go to the Plugins tab, create a Script or QuickParse plugin for the site, and follow the instructions there to write and host the plugin.
    </p>
    <div class="GenSection">
      <h3>Generate "Follow on JungleReader" Button</h3>
      <p>Want a "Follow on JungleReader" button for your own website or feed? You can generate one here.</p>
      <ButtonGenerator />
    </div>
  </div>
</template>

<style scoped>
.AddSupport {
}

.AddSupport p {
  margin-bottom: var(--space-m);
}

.GenSection {
  margin-top: var(--space-l);
}

</style>
