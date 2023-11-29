import { reactive, ref } from 'vue'
import { addElem, removeElem, hashString, prettyJson, countToHumanStr,
  isValidUrl, cleanUrl, } from './Utils.js'

/*
RssText (.rsst file) is a variant of the RSS file format that is easier for humans to read and 
write than regular XML RSS feeds.

The Format:
===========
Link: https://myblog.com

Title: Post 1
Link: https://myblog.com/post1
Date: 2023-11-26

This is a sample post.

Title: Post 2
Link: https://www.myblog.com/post2
Date: 2023-11-24

This is another sample post!

Title: Post 3
Link: https://myblog.com/post3
Date: 2023-11-20

This is a third sample post.
*/
/*
Rough spec:
Starts with a list of `Key: Value` lines for the feed, followed by a line break.
Optional Fields:
- Link (Link to the main site. Ex. www.mysite.com)

Next is a list of posts.

Each post is: some `Key: Value` lines, line-break, post body, then line-break.
The `Title: Some Title` line must be the first `Key: Value` line.

Required Fields:
- Title (also must be the first field!)

Optional Fields:
- Link
- Date (preferably in the format YYYY-MM-DDTHH:mm:ss.sssZ, but really anything `new Date` can handle)
- Author
*/

function hasLine(state) {
  return state.lineIndex < state.lines.length;
}

function parseFieldLine(line) {
  // Returns [fieldInfo, error]
  // Field format:
  // Key: Some value goes key
  let colonIndex = line.indexOf(":");
  if (colonIndex == -1) {
    // Not a field line
    return [null, true];
  }
  let key = line.substring(0, colonIndex).toLowerCase();
  let value = line.substring(colonIndex + 1).trim();
  if (key.indexOf(" ") != -1) {
    // Keys cannot contain spaces. This helps distinguish body lines with colons from field lines
    return [null, true];
  }
  return [{key: key, value: value}, false];
}

function skipBlankLines(state) {
  while (hasLine(state)) {
    if (state.lines[state.lineIndex]) {
      break;
    } else {
      state.lineIndex++;
    }
  }
}

function parseFieldsList(state) {
  let fields = {};
  while (hasLine(state)) {
    let line = state.lines[state.lineIndex];
    if (!line) {
      // Field lists are terminated by a blank line
      break;
    }
    let [lineInfo, error] = parseFieldLine(line);
    if (error) {
      throw new Error(`Error parsing line: ${state.lineIndex + 1}`);
    }
    fields[lineInfo.key] = lineInfo.value;
    state.lineIndex++;
  }
  return fields;
}

function parseFileHeader(state) {
  skipBlankLines(state);
  let fields = parseFieldsList(state);
  if ('link' in fields) {
    state.result.link = fields['link'];
  }
}

function getRequiredField(fields, key) {
  if (!(key in fields)) {
    throw new Error(`Could not find required field: ${key}`);
  }
  return fields[key];
}

function getOptionalField(fields, key, defaultVal) {
  if (!(key in fields)) {
    return defaultVal;
  }
  return fields[key];
}

function isValidDateStr(dateStr, lineNum) {
  try {
    let date = new Date(dateStr);
  } catch (error) {
    console.log(`The date around line ${lineNum} is not in a valid format. Valid formats: ` +
      `2023-11-28, 2023-11-28T14:48, etc. (YYYY-MM-DDTHH:mm:ss.sssZ).`);
    return false;
  }
  return true;
}

function parsePost(state) {
  let post = {};
  skipBlankLines(state);

  // Fields
  let firstLine = state.lineIndex;
  try {
    let fields = parseFieldsList(state);
    post.title = getRequiredField(fields, "title");
    post.link = getOptionalField(fields, "link", null);
    let pubDate = getOptionalField(fields, "date", null);
    if (pubDate && isValidDateStr(pubDate)) {
      post.pubDate = pubDate;
    }
    post.creator = getOptionalField(fields, "author", null);
  } catch (error) {
    console.log(error);
    throw new Error(`Error around line ${firstLine} - ${error}`);
  }

  // Body
  post.description = "";
  while (hasLine(state)) {
    let line = state.lines[state.lineIndex];
    let [lineInfo, error] = parseFieldLine(line);
    if (!error && lineInfo.key == "title") {
      // Done when we hit the title line of the next post
      break;
    }
    post.description += line + "\n";
    state.lineIndex++;
  }
  post.description = post.description.trim();

  return post;
}

function parsePosts(state) {
  while (hasLine(state)) {
    let post = parsePost(state);
    state.result.items.push(post);
  }
}

export function parseRsst(body) {
  let lines = body.split('\n').map((line) => {
    return line.trim();
  });
  let parser = {
    lineIndex: 0,
    lines: lines,
    result: {
      link: null,
      items: []
    }
  };
  parseFileHeader(parser);
  parsePosts(parser);
  return parser.result;
};

