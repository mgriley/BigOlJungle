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

let rsstTemplate = `Name: MyFeed

Title: Post 1
Link: https://www.yoursite.com/blog/post1
Date: 2023-11-26

This is a sample post. Today we learned a recipe for blahblahblah.

Title: Post 2
Link: https://www.yoursite.com/blog/post2
Date: 2023-11-24

This is another sample post!

Title: Post 3
Link: https://yoursite.com/blog/post3
Date: 2023-11-20

This is a third sample post.
`

</script>

<template>
  <div class="AddSupport">
    <h1 class="PageHeader">Add Support</h1>
    <p class="EmphasisText"><b>Want to add JungleReader support to your own website (or someone else's)? Follow this guide.</b></p>
    <p>
    The best way to make your site readable on JungleReader is to add a RSS feed. A RSS feed is
    a simple HTML-like file that lists the posts on your website and gives links to them. 
    You simply make this
    file available at your website, like at "https://www.yoursite.com/feed.rss". JungleReader and many other
    RSS apps use this link to add the feed.
    </p>
    <p>
    If you made your website using a website-builder/generator tool like WordPress, Wix, Hugo, Jekyll, etc.
    then typically there will be a plugin available to automatically generate the feed.
    </p>
    <p>
    If no plugin is available, you can hand-write or generate the RSS file yourself. The format is pretty simple. JungleReader can also
    follow feed.rsst (RSS txt) files, which is a simplified RSS format we cooked up. Here are some templates to get started:
    </p>
    <p>Sample RSS file:</p>
    <p class="CodeBlock">{{ rssTemplate }}</p>
    <p>More info on RSS: <a href="https://www.w3schools.com/xml/xml_rss.asp">https://www.w3schools.com/xml/xml_rss.asp</a></p>
    <p>Sample RSST file:</p>
    <p class="CodeBlock">{{ rsstTemplate }}</p>
    <p>
    Once you have your RSS feed, you can create a "www.zajungle.com/#/addfeed/..." link that, once clicked, will take the user to their JungleReader page
    and prompt to add the feed. To generate this link, use the Button Generator form below.
    </p>
    <h4>Other Options</h4>
    <p>
    Another option is to write and host a custom plugin for your site. Basically, a custom plugin is a small script that knows how to take the HTML page of a site and generate a feed.
    To write one, check out the Plugins tab.
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
