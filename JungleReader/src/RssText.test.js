import { expect, test } from 'vitest'
import { parseRsst } from './RssText'

let kInput1 = `
Link: www.mysite.com

Title: Post 1
Link: www.mysite.com/posts/post1
Date: 2023-08-13

This is the post body
Hi

Title: Post 2
Link: www.mysite.com/posts/post2
Date: 2023-08-12

This is the body 2.
Hello World

Lol hi again
`

test('RssText', () => {
  let expected = {
    link: 'www.mysite.com',
    items: [
      {
        title: 'Post 1',
        link: 'www.mysite.com/posts/post1',
        pubDate: '2023-08-13',
        description: 'This is the post body\nHi',
      },
      {
        title: 'Post 2',
        link: 'www.mysite.com/posts/post2',
        pubDate: '2023-08-12',
        description: 'This is the body 2.\nHello World\n\nLol hi again',
      }
    ]
  };
  let actual = parseRsst(kInput1);
  expect(actual).toEqual(expected);
});

