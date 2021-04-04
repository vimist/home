# A Simple, Customisable Home Page
A simple, customisable, static home page that can manage your bookmarks and search using your preferred engine. All configurable with YAML.

## Getting started
Visit this URL to get started:
https://rawcdn.githack.com/vimist/home/master/index.html

This is the latest version of the home page, but you can replace "master" in the URL with any of the tags or commit hashes to get a specific version, so to access version 1 of the home page you would visit:
https://rawcdn.githack.com/vimist/home/v1/index.html

NB: I'd recommend specifying a specific version, so that if any breaking changes are made, they won't affect you unless you specifically go looking to upgrade.

### How to Use
After configuration (see below), start typing at the main screen to search your bookmarks, if you don't find what you're looking for, just hit "Enter" and your search will be forwarded to your chosen search engine. To go back to the main screen, hit "Esc". That's all there is to it.

### Configuration
The first thing you'll see when you visit the home page for the first time is a prompt asking for a configuration file. This file needs to be accessible over HTTP (that allows [cross origin requests][cors]).

NB: I personally use a private [GitHub Gist][gist] for my configuration file and paste in the URL to the raw file. Top tip: remove the last hash from the raw URL to always get the latest version of your config file.

#### The Options

There are currently four main configuration options that can be specified in this configuration [YAML][yaml] file (which can appear in any order).

Specify your search engine (`%s` will be substituted for your search term):
```yaml
search_engine: https://duckduckgo.com/?p=%s
```
Define some static links that appear under the clock. Hopefully the following is fairly self explanatory (you can specify multiple categories and then different links within those categories):

```yaml
static_links:
  - category: News
    links:
      - title: BBC
        url: https://bbc.co.uk
  - category: Development
    links:
      - title: GitHub
        url: https://github.com
      - title: Github Gists
        url: https://gists.github.com
```
List your bookmarks (these are immediately searchable when you start typing at the main screen):

```yaml
bookmarks:
  - title: Google
    url: https://google.co.uk
    date_added: 04/04/2021
    keywords: search engine
  - title: Reddit
    url: https://reddit.com
    date_added: 04/04/2021
    keywords: social memes
```

You can also specify some custom CSS to be injected into the page to change the look and feel:

```yaml
custom_css: |
  body {
    background: linear-gradient(0deg, rgb(64, 171, 208) 0%, rgb(16, 81, 236) 100%);
  }
```

## Contributing

I've only tested this in Firefox as it's primarily a personal tool, so if you have any issues in other browsers, please raise an issue and if you're able, submit a pull request to resolve.

I'm happy to take feature requests as well, but again, if you're able to implement the feature yourself, please raise an issue and submit a pull request.


[cors]: https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
[gist]: https://gist.github.com
[yaml]: https://yaml.org
