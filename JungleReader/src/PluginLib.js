import { reactive, ref } from 'vue'

export class FeedPlugin {
  constructor(name) {
    this.name = name;
    this.urlPlaceholderHelp = "";
    this.quickHelpDocs = "";
  }

  updateFeeds(feeds) {
    // Impl in subclass
  }
}


