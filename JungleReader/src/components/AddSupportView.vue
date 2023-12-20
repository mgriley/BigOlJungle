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
    <h3>Option 1 - Add a RSS Feed (Recommended)</h3>
    <p>
    A RSS feed is a simple file that lists the posts on your website. You write (or generate) this file
    then add it to your site, like at "https://www.yoursite.com/feed.rss". Use this url to make a 'Follow on JungleReader' link, at
    the bottom of this page.
    </p>
    <p>
    Typically you'll want to generate the RSS file using your website-builder tool (most have RSS plugins), but you can also write one yourself if desperate.
    </p>
    <p>Sample RSS file:</p>
    <p class="CodeBlock">{{ rssTemplate }}</p>
    <p>More info on RSS: <a href="https://www.w3schools.com/xml/xml_rss.asp">https://www.w3schools.com/xml/xml_rss.asp</a></p>
    <h3>Option 2 - Add a RSST Feed</h3>
    <p>
    If the idea of generating the RSS file or writing it yourself seems daunting, don't worry. JungleReader supports
    a simpler format called RSST (RSS Text) which we cooked up. It is designed to be easily written and read by humans and computers.
    Write this file, add it to your site, then make a 'Follow on JungleReader' link below.
    </p>
    <p>Sample RSST file:</p>
    <p class="CodeBlock">{{ rsstTemplate }}</p>
    <h3>Option 3 - Make a Custom Plugin</h3>
    <p>
    You can write and host a custom JungleReader plugin for your site. A custom plugin is a small script that knows how to take the HTML page of a site and generate a feed from it.
    See the Plugins tab to get started.
    </p>
    <div class="GenSection">
      <h3>Get your "Follow on JungleReader" link</h3>
      <p>Want a "Follow on JungleReader" link/button for your website? You can generate one here.</p>
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
