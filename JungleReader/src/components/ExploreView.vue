<script setup>
import { gApp, FeedGroup, Feed } from '../State.js'

let exploreData = [
  {
    group: 'Dev Feeds',
    type: 'RSS',
    feeds: [
      {name: 'JungleReader Development', desc: '', url: 'https://www.zajungle.com/devfeed.rsst'},
    ]
  },
  {
    group: 'Mastodon Feeds',
    type: 'Mastodon',
    feeds: [
      {name: 'XKCD Bot', desc: 'Posts XKCD comics', url: 'https://mastodon.xyz/@xkcd'},
      {name: 'Astronomy Picture of the Day', desc: 'Posts astronomy pics', url: 'https://botsin.space/@APoD'},
      {name: 'FediFollows', desc: 'Posts fediverse accounts to follow', url: 'https://mastodon.online/@FediFollows@social.growyourown.services'},
      {name: 'FediTips', desc: 'Mastodon/Fediverse tips', url: 'https://mstdn.social/@feditips'},
      {name: 'Mastodon Art Curator', desc: 'Mastodon art related posts/curation', url: 'https://mastodon.art/@Curator'},
      {name: 'Mozilla', desc: 'Mozilla account', url: 'https://mastodon.social/@mozilla@mozilla.social'},
      {name: 'EFF', desc: 'Electronic Frontier Foundation', url: 'https://mastodon.social/@eff'},
      {name: 'Terence Tao', desc: 'Mathematics', url: 'https://mathstodon.xyz/@tao'},
      {name: 'The Linux Experiment', desc: 'Linux tips, reviews, etc.', url: 'https://mastodon.social/@thelinuxEXP'},
    ]
  },
  {
    group: "RSS Feeds",
    type: 'RSS',
    feeds: [
      {name: 'BBC Top Stories', desc: 'BBC top stories', url: 'http://feeds.bbci.co.uk/news/rss.xml'},
      {name: 'BBC World News', desc: 'BBC World News', url: 'http://feeds.bbci.co.uk/news/world/rss.xml'},
      {name: 'CNN Top Stories', desc: 'CNN Top Stories', url: 'http://rss.cnn.com/rss/cnn_topstories.rss'},
      {name: 'CNN World News', desc: 'CNN World News', url: 'http://rss.cnn.com/rss/cnn_world.rss'},
      {name: 'CNN US News', desc: 'CNN US News', url: 'http://rss.cnn.com/rss/cnn_us.rss'},
      {name: 'The Guardian, Top Stories', url: 'theguardian.com/rss'},
      {name: 'The Guardian, World News', url: 'theguardian.com/world/rss'},
      {name: 'NYT World News', desc: "New York Times World News", url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml'},
      {name: 'NYT US News', desc: 'New York Times US News', url: 'https://rss.nytimes.com/services/xml/rss/nyt/US.xml'},
      {name: 'HN Front Page', desc: 'HN posts as they enter the front page, from https://hnrss.github.io/#firehose-feeds', url: 'https://hnrss.org/frontpage'},
      {name: "BearBlog Discovery Feed", desc: '', url: 'https://bearblog.dev/discover/feed/'},
      {name: 'The Verge', desc: 'All Verge posts', url: 'https://www.theverge.com/rss/index.xml'},
      {name: 'Ars Technica', desc: 'All Ars Technica posts', url: 'https://feeds.arstechnica.com/arstechnica/index'},
      {name: 'TechCrunch', desc: 'TechCrunch', url: 'https://techcrunch.com/feed/'},
      {name: 'Wired Top Stories', desc: 'Wired Top Stories', url: 'https://www.wired.com/feed/rss'},
      {name: 'BillBoard', desc: 'BillBoard, music news', url: 'https://www.billboard.com/feed/'},
      {name: 'Wikipedia Featured Article', desc: 'Wikipedia featured article', url: 'https://en.wikipedia.org/w/api.php?action=featuredfeed&feed=featured'},
      {name: 'Wikipedia Picture of the Day', desc: 'Wikipedia pic of the day', url: 'https://en.wikipedia.org/w/api.php?action=featuredfeed&feed=potd'},
      {name: 'Saturday Morning Breakfast Cereal', desc: 'SMBC web comic', url: 'https://www.smbc-comics.com/comic/rss'},
      {name: 'HighScalability', desc: 'highscalability.com feed', url: 'http://feeds.feedburner.com/HighScalability'},
      {name: 'MacRumors', desc: 'MacRumors', url: 'https://feeds.macrumors.com/MacRumors-All'},
      {name: 'Nature', desc: 'Nature journal feed', url: 'https://www.nature.com/nature.rss'},
      {name: 'Signal V. Noise', desc: 'Signal V. Noise (tech blog by makers of BaseCamp)', url: 'https://m.signalvnoise.com/feed/'},
      {name: 'TEDTalks', desc: 'TEDTalks', url: 'http://feeds.feedburner.com/tedtalks_video'},
      {name: 'TILvids PeerTube', desc: 'Assorted educational content', url: 'https://tilvids.com/feeds/videos.xml?videoChannelId=87'},
    ]
  },
  {
    group: "People",
    type: 'RSS',
    feeds: [
      {name: "Julia Evans (Programming)", desc: '', url: 'https://jvns.ca/atom.xml'},
      {name: "Armin Ronacher (Programming)", url: 'https://lucumr.pocoo.org/feed.atom'},
      {name: 'Chris Wellons (Programming)', url: 'https://nullprogram.com/feed/'},
      {name: "Eric Radman (Programming)", url: 'http://eradman.com/'},
      {name: "Hugo Tunius (Programming)", url: "https://hugotunius.se/"},
      {name: "Vitalik Buterin (Ethereum)", desc: "Vitalik Buterin's blog", url: 'https://vitalik.ca/feed.xml'},
      {name: 'Astral Codex Ten', desc: '', url: 'https://www.astralcodexten.com/feed'},
      {name: 'Krebs on Security', desc: 'Krebs on Security', url: 'https://krebsonsecurity.com/feed/'},
      {name: 'Schneier on Security', desc: 'Schneier on Security', url: 'https://www.schneier.com/feed/atom'},
      {name: "Seth Godin (Marketing)", desc: 'Seth Godin, marketing', url: 'http://feeds.feedburner.com/typepad/sethsmainblog'},
      {name: "Noam Chomsky", desc: '', url: 'http://chomsky.info/feed/'},
    ]
  },
  {
    group: "Reddit Feeds",
    type: 'Reddit',
    feeds: [
      {name: 'r/Technology', desc: 'Technology', url: 'https://www.reddit.com/r/technology'},
      {name: 'r/WorldNews', desc: 'World News', url: 'https://www.reddit.com/r/worldnews/'},
      {name: 'r/Games', desc: 'Games', url: 'https://www.reddit.com/r/Games/'},
      {name: 'r/AskCulinary', desc: 'Games', url: 'https://www.reddit.com/r/AskCulinary/'},
      {name: 'r/AskScience', desc: 'Ask science', url: 'https://www.reddit.com/r/askscience/'},
      {name: 'r/AskHistorians', desc: 'Ask historians', url: 'https://www.reddit.com/r/askhistorians'},
      {name: 'r/EatCheapAndHealthy', desc: 'Eat cheap and healthly', url: 'https://www.reddit.com/r/EatCheapAndHealthy/'},
      {name: 'r/Fitness', desc: 'Fitness', url: 'https://www.reddit.com/r/fitness'},
    ]
  },
  {
    group: "YouTube Channels",
    type: 'YouTube',
    feeds: [
      {name: 'Creating Games', desc: '', url: 'https://www.youtube.com/@sora_sakurai_en'},
      {name: 'Veritasium', desc: 'Veritasium', url: 'https://www.youtube.com/channel/UCHnyfMqiRRG1u-2MsSQLbXA'},
      {name: 'National Geographic', desc: 'National Geographic', url: 'https://www.youtube.com/channel/UCpVm7bg6pXKo1Pr6k5kxG9A'},
      {name: 'Numberphile', desc: 'Numberphile', url: 'https://www.youtube.com/channel/UCoxcjq-8xIDTYp3uz647V5A'},
    ],
  }
]

function addFeed(name, type, url) {
  gApp.feedReader.addFeed({name: name, type: type, url: url});
  gApp.toast({message: 'Added!', type: 'success'});  
}

</script>

<template>
  <div class="ExploreView">
    <h1 class="PageHeader">Explore</h1>
    <p class="Info">
    Here is a small sample of feeds you can use to get started.
    To add JungleReader support to your own website, go to <router-link class="LinkButton" to="/addsupport">Add Support</router-link>.
    </p> 
    <div class="Groups">
      <div v-for="group in exploreData" class="Group">
        <h3>{{ group.group }}</h3>
        <ul>
          <li v-for="feed in group.feeds">
            <button class="SmallButton Block" @click="addFeed(feed.name, group.type, feed.url)">{{ feed.name }}</button>
          </li>
        </ul>
      </div>
    </div>
    <div class="OtherTips">
      <h3>Other Tips:</h3>
      <ul>
        <li>
          If a website doesn't support RSS but you'd like to follow it, here are some options:
          <ul>
            <li>Use the builtin Bookmark plugin to make a bookmark to it.</li>
            <li>Use the builtin Watcher plugin to watch a static page (like a blog homepage) for changes.</li>
            <li>Create a custom script plugin through the Plugins tab.</li>
          </ul>
        </li>
        <li>Most podcasts have RSS feeds.</li>
        <li>Sijmen Mulder has a list of good text-based websites <a href="https://sjmulder.nl/en/textonly.html">here</a></li>
        <li>See <a href="https://getstarted.social/" target="_blank">https://getstarted.social/</a> for Mastodon feed ideas.</li>
        <li>See <a href="https://hnrss.github.io/" target="_blank">https://hnrss.github.io/</a> for various HN RSS feeds.</li>
        <li>See <a href="https://www.cnn.com/services/rss/" target="_blank">https://www.cnn.com/services/rss/</a> for different CNN feeds.</li>
        <li>See <a href="https://www.nytimes.com/rss" target="_blank">https://www.nytimes.com/rss</a> for different NYT feeds.</li>
        <li>See <a href="https://github.com/PrejudiceNeutrino/YouTube_Channels" target="_blank">https://github.com/PrejudiceNeutrino/YouTube_Channels</a> for lists of educational YouTube channels.</li>
        <li>See <a href="https://info.arxiv.org/help/rss.html" target="_blank">https://info.arxiv.org/help/rss.html</a> to setup feeds for arxiv.org</li>
        <li>Substack blogs have RSS feeds at "www.someblog.com/feed"</li>
        <li>PeerTube supports RSS feeds.</li>
        <li>See neocities for some interesting websites/blogs. Not all support RSS.</li>
        <li>If you know any other good websites/blogs to add, please use the Report Bug/Feedback form.</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.Info {
  margin-bottom: var(--space-m);
}

.Groups {
  margin-bottom: var(--space-xl);
}

.Group {
  margin-bottom: var(--space-s);
}

</style>
