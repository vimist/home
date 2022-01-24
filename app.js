/**
 * Polyfills
 */

if (!String.prototype.padStart) {
    String.prototype.padStart = function(num, char) {
        var out = this.toString();
        for (var i = 0; i < num - out.length; ++i)
            out = char + out;
        return out;
    }
}


/**
 * Components
 */

var SetConfigLocation = {
    oninit: function(vnode) {
        vnode.state.value = state.config_url;
    },
    view: function(vnode) {
        return [
            state.config_url && state.config_error
                ? m('h1', 'Error Loading Config')
                : m('h1', 'Config File URL'),
            m('input[type=text].config-url', { oninput: function(e) {
                vnode.state.value = e.target.value;
            }, onkeydown: function(e) {
                if (e.key === 'Enter') {
                    window.localStorage.setItem('config_url', vnode.state.value);
                    state.config_url = vnode.state.value;

                    if (state.config_url)
                        load_config(state.config_url);

                }

                e.stopPropagation();
            }, value: vnode.state.value }),
            m('a', { href: 'https://github.com/vimist/home' }, 'Read the README'),
            ' or press enter to save'
        ];
    }
};

var ClearConfigLocation = {
    view: function(vnode) {
        return m('button.clear-config-url', { onclick: function() {
            window.localStorage.removeItem('config_url');
            state.config_url = null;
        }, title: 'Clear configuration URL' }, 'x');
    }
};

var Time = {
    oninit: function(vnode) {
        vnode.state.interval = setInterval(function() {
            m.redraw();
        }, 60 * 1000);
    },
    onremove: function(vnode) {
        clearInterval(vnode.state.interval);
    },
    view: function(vnode) {
        var date = new Date();

        return m('h1.time', [
            date.getHours().toString().padStart(2, '0'), ':',
            date.getMinutes().toString().padStart(2, '0')
        ]);
    }
};


var DayDate = {
    oninit: function(vnode) {
        vnode.state.interval = setInterval(function() {
            m.redraw();
        }, 24 * 60 * 60 * 1000);
    },
    onremove: function(vnode) {
        clearInterval(vnode.state.interval);
    },
    view: function(vnode) {
        var date = new Date();
        var days = [
            'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
            'Saturday'];
        var months = [
            'January', 'Febuary', 'March', 'April', 'May', 'June', 'July',
            'August', 'September', 'October', 'November', 'December'];

        return m('span.date', [
            days[date.getDay()], ', ',
            date.getDate(), ' ',
            months[date.getMonth()], ' ',
            date.getFullYear()
        ]);
    }
};


var StaticLinks = {
    view: function(vnode) {
        return m('div.static-links', state.static_links.map(function(category) {
            return m('div.category', [
                m('span.link-category', category.category),
                m('ol.static-links', category.links.map(function(link) {
                    return m('li',
                        m('a', { href: link.url }, link.title));
                }))
            ]);
        }));
    }
};


var SearchBox = {
    oncreate: function(vnode) {
        vnode.dom.focus();
    },
    view: function(vnode) {
        return m('input[type=text].search', {
            oninput: function(e) {
                set_filters(e.target.value);
            },
            onkeydown: function(e) {
                var search = encodeURIComponent(e.target.value);
                if (e.key == 'Enter') {
                    window.location = e.shiftKey || !state.top_bookmark
                        ? state.search_engine.replace('%s', search)
                        : state.top_bookmark.url
                }
            },
            value: state.filters.join(' ')
        });
    }
};

var Bookmark = {
    view: function(vnode) {
        return [
            m('a', { 'href': vnode.attrs.url }, [
                vnode.attrs.title,
                m('br'),
                m('span.url', vnode.attrs.url)
            ]),
            m('div.keywords', vnode.attrs.keywords.map(function(keyword) {
                return m('button.keyword', { onclick: function() {
                    set_filters(keyword);
                } }, keyword);
            }))
        ];
    }
};

var BookmarkList = {
    view: function(vnode) {
        var bookmarks = filter_bookmarks(state.bookmarks, state.filters);
        bookmarks = bookmarks.sort(function(b1, b2) {
            return b1[state.sort_by] < b2[state.sort_by]
                ? state.order
                : state.order * -1;
        });

        if (bookmarks.length > 0)
            state.top_bookmark = bookmarks[0];
        else
            state.top_bookmark = null;

        return m('ol.search-results', bookmarks.map(function(bookmark, i) {
            return m('li', {
                key: bookmark.url,
            }, m(Bookmark, {
                title: bookmark.title,
                keywords: bookmark.keywords,
                url: bookmark.url,
                date_added: bookmark.date_added,
            }));
        }));
    }
};

var App = {
    oninit: function(vnode) {
        if (state.config_url)
            load_config(state.config_url);
    },
    view: function() {
        return [
            !state.config_url || state.config_error ? [
                m(SetConfigLocation)
            ] : state.show_search ? [
                m(SearchBox),
                m(BookmarkList)
            ] : [
                m(ClearConfigLocation),
                m(Time),
                m(DayDate),
                m(StaticLinks)
            ],
            state.custom_css
                ? m('style', { type: 'text/css' }, state.custom_css) : null
        ];
    }
};


/**
 * Init & Globals
 */

function init_state() {
    return {
        config_url: window.localStorage.getItem('config_url'),
        config_error: false,

        show_search: false,
        custom_css: null,

        filters: [],
        sort_by: 'date',
        order: 1,
        bookmarks: [],

        static_links: [],

        search_engine: ''
    };
}

function set_filters(filters) {
    state.filters = filters.split(' ');
}

function add_bookmark(bookmark) {
    Object.assign(bookmark, {
        'keywords': !bookmark.keywords
            ? []
            : bookmark.keywords.split(' '),
        'date_added': !bookmark.date_added
            ? null
            :bookmark.date_added
    });

    state.bookmarks.push({
        'title': bookmark.title,
        'url': bookmark.url,
        'date_added': bookmark.date_added,
        'keywords': bookmark.keywords,
    });
}

function filter_bookmarks(bookmarks, filters) {
    return bookmarks.filter(function(bookmark) {
        var matching = 0;
        for (var i = 0; i < filters.length; ++i) {
            var filter = filters[i].toLowerCase();

            if (
                bookmark.title.toLowerCase().indexOf(filter) > -1
                || bookmark.url.toLowerCase().indexOf(filter) > -1
            ) {
                matching++;
                continue;
            }

            for (var j = 0; j < bookmark.keywords.length; ++j) {
                var keyword = bookmark.keywords[j];
                if (keyword.toLowerCase().indexOf(filter) > -1) {
                    matching++;
                    break
                }
            }
        }

        return matching >= filters.length;
    });
}

function load_config(config_url) {
    m.request({
        method: 'GET',
        url: config_url,
        responseType: 'text',
        deserialize: jsyaml.load
    }).then(function(result) {
        state = init_state();

        if (result.custom_css)
            state.custom_css = result.custom_css;

        if (result.static_links)
            state.static_links = result.static_links;

        if (result.search_engine)
            state.search_engine = result.search_engine;

        for (var i = 0; i < state.static_links.length; ++i) {
            for (var j = 0; j < state.static_links[i].links.length; ++j)
                add_bookmark(state.static_links[i].links[j]);
        }

        for (var i = 0; result.bookmarks && i < result.bookmarks.length; ++i)
            add_bookmark(result.bookmarks[i]);

        state.config_error = false;
    }).catch(function(e) {
        console.error(e);
        state.config_error = true;
    });
}


var state = init_state();

window.addEventListener('DOMContentLoaded', function(e) {
    window.addEventListener('keydown', function(e) {
        if (e.key == 'Escape') {
            state.show_search = false;
            set_filters('');
        } else if (state.config_url && !state.config_error && !state.show_search) {
            if (e.key.length == 1)
                set_filters(e.key);

            state.show_search = true;
        }

        m.redraw();
    });

    window.addEventListener('paste', function(e) {
        if (!state.show_search) {
            set_filters(e.clipboardData.getData('text'));
            state.show_search = true;
            m.redraw();
        }
    });

    document.body.addEventListener('click', function(e) {
        state.show_search = false;
        m.redraw();
    });

    document.getElementById('app').addEventListener('click', function(e) {
        e.stopPropagation();
    });

    m.mount(document.getElementById('app'), App);
});
