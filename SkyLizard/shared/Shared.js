/*
Shared
*/

export let SourceType = {
  Url: 'url',
  Git: 'git',
}

export class SourceInfo {
  constructor() {
    this.type = null;  // one of SourceType
  }

  getType() {
    return this.type;
  }
}

export class UrlSourceInfo extends SourceInfo {
  constructor() {
    super();
    this.type = SourceType.Url;
    this.url = null;
    this.version = null;  // optional version string
  }
}

export class GitSourceInfo extends SourceInfo {
  constructor() {
    super();
    this.type = SourceType.Git;
    this.repo = null;  // git repo URL
    this.branch = null;   // branch, tag, or commit
  }
}

export let AppStatus = {
  Running: 'running',
  Stopped: 'stopped',
}

export class AppInfo {
  constructor() {
    this.idString = null;
    this.sourceInfo = null;
    this.status = AppStatus.Stopped;
    this.error = null;  // error message if any
  }

  getId() {
    return this.idString;
  }
}