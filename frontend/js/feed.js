/*
 * 姓名：王慧琳 | 学号：24001010731 | 时间：2026-11-23 | 大模型：TRAE DeepSeek-V4.1-Flash
 * 作用：首页知乎信息流与全站热榜
 */
(function () {
  'use strict';

  var Wanghl_listEl = document.getElementById('Wanghl_feedList');
  var Wanghl_tabsEl = document.getElementById('Wanghl_feedTabs');
  var Wanghl_countEl = document.getElementById('Wanghl_feedCount');
  var Wanghl_hotEl = document.getElementById('Wanghl_hotList');

  var Wanghl_state = {
    tab: 'recommend',
    news: [],
    gallery: [],
    loaded: false
  };

  function Wanghl_formatViews(Wanghl_num) {
    var Wanghl_value = Number(Wanghl_num) || 0;
    if (Wanghl_value >= 10000) {
      return (Wanghl_value / 10000).toFixed(1).replace(/\.0$/, '') + ' 万';
    }
    return String(Wanghl_value);
  }

  function Wanghl_showSkeleton() {
    Wanghl_listEl.textContent = '';
    for (var Wanghl_i = 0; Wanghl_i < 4; Wanghl_i++) {
      var Wanghl_li = document.createElement('li');
      Wanghl_li.className = 'Wanghl_feed-skeleton';

      var Wanghl_l1 = document.createElement('div');
      Wanghl_l1.className = 'Wanghl_feed-skeleton-line Wanghl_feed-skeleton-line--title';

      var Wanghl_l2 = document.createElement('div');
      Wanghl_l2.className = 'Wanghl_feed-skeleton-line';

      var Wanghl_l3 = document.createElement('div');
      Wanghl_l3.className = 'Wanghl_feed-skeleton-line';

      var Wanghl_l4 = document.createElement('div');
      Wanghl_l4.className = 'Wanghl_feed-skeleton-line Wanghl_feed-skeleton-line--short';

      Wanghl_li.appendChild(Wanghl_l1);
      Wanghl_li.appendChild(Wanghl_l2);
      Wanghl_li.appendChild(Wanghl_l3);
      Wanghl_li.appendChild(Wanghl_l4);
      Wanghl_listEl.appendChild(Wanghl_li);
    }
  }

  function Wanghl_showState(Wanghl_text, Wanghl_isError) {
    Wanghl_listEl.textContent = '';
    var Wanghl_li = document.createElement('li');
    Wanghl_li.className = 'Wanghl_feed-state' + (Wanghl_isError ? ' Wanghl_feed-state--error' : '');
    Wanghl_li.textContent = Wanghl_text;
    Wanghl_listEl.appendChild(Wanghl_li);
  }

  function Wanghl_createAvatar(Wanghl_text, Wanghl_alt) {
    var Wanghl_avatar = document.createElement('span');
    Wanghl_avatar.className = 'Wanghl_feed-avatar' + (Wanghl_alt ? ' Wanghl_feed-avatar--alt' : '');
    Wanghl_avatar.textContent = String(Wanghl_text || '知').slice(0, 1);
    return Wanghl_avatar;
  }

  function Wanghl_createNewsItem(Wanghl_item, Wanghl_index) {
    var Wanghl_li = document.createElement('li');
    Wanghl_li.className = 'Wanghl_feed-item';
    Wanghl_li.style.animationDelay = Math.min(Wanghl_index * 45, 270) + 'ms';

    var Wanghl_author = document.createElement('div');
    Wanghl_author.className = 'Wanghl_feed-author';
    Wanghl_author.appendChild(Wanghl_createAvatar(Wanghl_item.author));

    var Wanghl_name = document.createElement('span');
    Wanghl_name.className = 'Wanghl_feed-author-name';
    Wanghl_name.textContent = Wanghl_item.author;

    var Wanghl_meta = document.createElement('span');
    Wanghl_meta.className = 'Wanghl_feed-author-meta';
    Wanghl_meta.textContent = Wanghl_item.source + ' · ' + Wanghl_item.publishTime;

    var Wanghl_badge = document.createElement('span');
    Wanghl_badge.className = 'Wanghl_feed-badge';
    Wanghl_badge.textContent = Wanghl_item.category;

    Wanghl_author.appendChild(Wanghl_name);
    Wanghl_author.appendChild(Wanghl_meta);
    Wanghl_author.appendChild(Wanghl_badge);

    var Wanghl_title = document.createElement('a');
    Wanghl_title.className = 'Wanghl_feed-title';
    Wanghl_title.href = 'news.html';
    Wanghl_title.textContent = Wanghl_item.title;

    var Wanghl_excerpt = document.createElement('p');
    Wanghl_excerpt.className = 'Wanghl_feed-excerpt';
    Wanghl_excerpt.textContent = Wanghl_item.summary;

    Wanghl_li.appendChild(Wanghl_author);
    Wanghl_li.appendChild(Wanghl_title);
    Wanghl_li.appendChild(Wanghl_excerpt);

    if (Wanghl_item.tags) {
      var Wanghl_tags = document.createElement('div');
      Wanghl_tags.className = 'Wanghl_feed-tags';
      String(Wanghl_item.tags)
        .split(',')
        .forEach(function (Wanghl_tag) {
          var Wanghl_text = Wanghl_tag.trim();
          if (!Wanghl_text) return;
          var Wanghl_tagEl = document.createElement('span');
          Wanghl_tagEl.className = 'Wanghl_feed-tag';
          Wanghl_tagEl.textContent = '#' + Wanghl_text;
          Wanghl_tags.appendChild(Wanghl_tagEl);
        });
      Wanghl_li.appendChild(Wanghl_tags);
    }

    var Wanghl_actions = document.createElement('div');
    Wanghl_actions.className = 'Wanghl_feed-actions';

    var Wanghl_read = document.createElement('a');
    Wanghl_read.className = 'Wanghl_feed-action';
    Wanghl_read.href = 'news.html';
    Wanghl_read.textContent = '阅读全文';

    var Wanghl_views = document.createElement('span');
    Wanghl_views.textContent = '浏览 ' + Wanghl_formatViews(Wanghl_item.viewCount);

    var Wanghl_right = document.createElement('span');
    Wanghl_right.className = 'Wanghl_feed-meta-right';
    Wanghl_right.textContent = '科技新闻 · #' + Wanghl_item.id;

    Wanghl_actions.appendChild(Wanghl_read);
    Wanghl_actions.appendChild(Wanghl_views);
    Wanghl_actions.appendChild(Wanghl_right);
    Wanghl_li.appendChild(Wanghl_actions);

    return Wanghl_li;
  }

  function Wanghl_createGalleryItem(Wanghl_item, Wanghl_index) {
    var Wanghl_li = document.createElement('li');
    Wanghl_li.className = 'Wanghl_feed-item Wanghl_feed-item--gallery';
    Wanghl_li.style.animationDelay = Math.min(Wanghl_index * 45, 270) + 'ms';

    var Wanghl_author = document.createElement('div');
    Wanghl_author.className = 'Wanghl_feed-author';
    Wanghl_author.appendChild(Wanghl_createAvatar(Wanghl_item.author, true));

    var Wanghl_name = document.createElement('span');
    Wanghl_name.className = 'Wanghl_feed-author-name';
    Wanghl_name.textContent = Wanghl_item.author;

    var Wanghl_meta = document.createElement('span');
    Wanghl_meta.className = 'Wanghl_feed-author-meta';
    Wanghl_meta.textContent =
      Wanghl_item.source + (Wanghl_item.location ? ' · ' + Wanghl_item.location : '');

    var Wanghl_badge = document.createElement('span');
    Wanghl_badge.className = 'Wanghl_feed-badge';
    Wanghl_badge.textContent = Wanghl_item.category;

    Wanghl_author.appendChild(Wanghl_name);
    Wanghl_author.appendChild(Wanghl_meta);
    Wanghl_author.appendChild(Wanghl_badge);

    var Wanghl_body = document.createElement('div');
    Wanghl_body.className = 'Wanghl_feed-body';

    var Wanghl_content = document.createElement('div');
    Wanghl_content.className = 'Wanghl_feed-content';

    var Wanghl_title = document.createElement('a');
    Wanghl_title.className = 'Wanghl_feed-title';
    Wanghl_title.href = 'gallery.html';
    Wanghl_title.textContent = Wanghl_item.title;

    var Wanghl_excerpt = document.createElement('p');
    Wanghl_excerpt.className = 'Wanghl_feed-excerpt';
    Wanghl_excerpt.textContent = Wanghl_item.description;

    Wanghl_content.appendChild(Wanghl_title);
    Wanghl_content.appendChild(Wanghl_excerpt);

    var Wanghl_thumb = document.createElement('div');
    Wanghl_thumb.className = 'Wanghl_feed-thumb';

    var Wanghl_img = document.createElement('img');
    Wanghl_img.src = Wanghl_item.imageUrl;
    Wanghl_img.alt = Wanghl_item.imageAlt || Wanghl_item.title;
    Wanghl_img.loading = 'lazy';
    Wanghl_img.addEventListener('error', function () {
      Wanghl_thumb.style.display = 'none';
    });
    Wanghl_thumb.appendChild(Wanghl_img);

    Wanghl_body.appendChild(Wanghl_content);
    Wanghl_body.appendChild(Wanghl_thumb);

    var Wanghl_actions = document.createElement('div');
    Wanghl_actions.className = 'Wanghl_feed-actions';

    var Wanghl_like = document.createElement('span');
    Wanghl_like.className = 'Wanghl_feed-action Wanghl_feed-action--like';
    Wanghl_like.textContent = '赞同 ' + Wanghl_formatViews(Wanghl_item.likeCount);

    var Wanghl_views = document.createElement('span');
    Wanghl_views.textContent = '浏览 ' + Wanghl_formatViews(Wanghl_item.viewCount);

    var Wanghl_right = document.createElement('span');
    Wanghl_right.className = 'Wanghl_feed-meta-right';
    Wanghl_right.textContent = '图文 · ' + Wanghl_item.publishTime;

    Wanghl_actions.appendChild(Wanghl_like);
    Wanghl_actions.appendChild(Wanghl_views);
    Wanghl_actions.appendChild(Wanghl_right);

    Wanghl_li.appendChild(Wanghl_author);
    Wanghl_li.appendChild(Wanghl_body);
    Wanghl_li.appendChild(Wanghl_actions);

    return Wanghl_li;
  }

  // 推荐：新闻与图文交替排列，视觉上更像混合信息流
  function Wanghl_mixFeed() {
    var Wanghl_mixed = [];
    var Wanghl_max = Math.max(Wanghl_state.news.length, Wanghl_state.gallery.length);
    for (var Wanghl_i = 0; Wanghl_i < Wanghl_max; Wanghl_i++) {
      if (Wanghl_state.news[Wanghl_i]) {
        Wanghl_mixed.push({ type: 'news', item: Wanghl_state.news[Wanghl_i] });
      }
      if (Wanghl_state.gallery[Wanghl_i]) {
        Wanghl_mixed.push({ type: 'gallery', item: Wanghl_state.gallery[Wanghl_i] });
      }
    }
    return Wanghl_mixed;
  }

  function Wanghl_getTabData() {
    if (Wanghl_state.tab === 'hot') {
      var Wanghl_all = Wanghl_state.news
        .map(function (Wanghl_item) {
          return { type: 'news', item: Wanghl_item };
        })
        .concat(
          Wanghl_state.gallery.map(function (Wanghl_item) {
            return { type: 'gallery', item: Wanghl_item };
          })
        );
      return Wanghl_all
        .sort(function (Wanghl_a, Wanghl_b) {
          return Number(Wanghl_b.item.viewCount) - Number(Wanghl_a.item.viewCount);
        })
        .slice(0, 10);
    }

    if (Wanghl_state.tab === 'news') {
      return Wanghl_state.news.map(function (Wanghl_item) {
        return { type: 'news', item: Wanghl_item };
      });
    }

    if (Wanghl_state.tab === 'gallery') {
      return Wanghl_state.gallery.map(function (Wanghl_item) {
        return { type: 'gallery', item: Wanghl_item };
      });
    }

    return Wanghl_mixFeed().slice(0, 10);
  }

  function Wanghl_renderFeed() {
    var Wanghl_data = Wanghl_getTabData();
    Wanghl_listEl.textContent = '';

    if (!Wanghl_data.length) {
      Wanghl_showState('暂时没有可展示的内容，请确认数据库已初始化。', false);
      Wanghl_countEl.textContent = '0 条';
      return;
    }

    Wanghl_data.forEach(function (Wanghl_entry, Wanghl_index) {
      Wanghl_listEl.appendChild(
        Wanghl_entry.type === 'gallery'
          ? Wanghl_createGalleryItem(Wanghl_entry.item, Wanghl_index)
          : Wanghl_createNewsItem(Wanghl_entry.item, Wanghl_index)
      );
    });

    Wanghl_countEl.textContent = '共 ' + Wanghl_data.length + ' 条内容';
  }

  function Wanghl_renderHot() {
    Wanghl_hotEl.textContent = '';

    var Wanghl_hot = Wanghl_state.news
      .slice()
      .sort(function (Wanghl_a, Wanghl_b) {
        return Number(Wanghl_b.viewCount) - Number(Wanghl_a.viewCount);
      })
      .slice(0, 6);

    if (!Wanghl_hot.length) {
      var Wanghl_empty = document.createElement('li');
      Wanghl_empty.className = 'Wanghl_hot-empty';
      Wanghl_empty.textContent = '热榜数据加载中…';
      Wanghl_hotEl.appendChild(Wanghl_empty);
      return;
    }

    Wanghl_hot.forEach(function (Wanghl_item, Wanghl_index) {
      var Wanghl_li = document.createElement('li');

      var Wanghl_link = document.createElement('a');
      Wanghl_link.className = 'Wanghl_hot-item';
      Wanghl_link.href = 'news.html';

      var Wanghl_rank = document.createElement('span');
      Wanghl_rank.className = 'Wanghl_hot-rank';
      Wanghl_rank.textContent = String(Wanghl_index + 1);

      var Wanghl_main = document.createElement('span');
      Wanghl_main.className = 'Wanghl_hot-main';

      var Wanghl_title = document.createElement('span');
      Wanghl_title.className = 'Wanghl_hot-title';
      Wanghl_title.textContent = Wanghl_item.title;

      var Wanghl_meta = document.createElement('span');
      Wanghl_meta.className = 'Wanghl_hot-meta';
      Wanghl_meta.textContent =
        Wanghl_item.category + ' · ' + Wanghl_formatViews(Wanghl_item.viewCount) + ' 浏览';

      Wanghl_main.appendChild(Wanghl_title);
      Wanghl_main.appendChild(Wanghl_meta);

      Wanghl_link.appendChild(Wanghl_rank);
      Wanghl_link.appendChild(Wanghl_main);
      Wanghl_li.appendChild(Wanghl_link);
      Wanghl_hotEl.appendChild(Wanghl_li);
    });
  }

  function Wanghl_loadFeed() {
    Wanghl_showSkeleton();
    Wanghl_countEl.textContent = '加载中…';

    var Wanghl_newsUrl = Wanghl_apiUrl('/api/news?page=1&pageSize=12');
    var Wanghl_galleryUrl = Wanghl_apiUrl('/api/gallery?page=1&pageSize=12');
    console.log('[Wanghl] 首页请求新闻接口：', Wanghl_newsUrl);
    console.log('[Wanghl] 首页请求图文接口：', Wanghl_galleryUrl);

    Promise.all([
      fetch(Wanghl_newsUrl).then(function (Wanghl_res) {
        return Wanghl_res.json();
      }),
      fetch(Wanghl_galleryUrl).then(function (Wanghl_res) {
        return Wanghl_res.json();
      })
    ])
      .then(function (Wanghl_results) {
        console.log('[Wanghl] /api/news 响应：', Wanghl_results[0]);
        console.log('[Wanghl] /api/gallery 响应：', Wanghl_results[1]);

        var Wanghl_news = Wanghl_results[0];
        var Wanghl_gallery = Wanghl_results[1];

        if (!Wanghl_news || Wanghl_news.code !== 0 || !Wanghl_news.data) {
          throw new Error((Wanghl_news && Wanghl_news.msg) || '新闻接口返回异常');
        }
        if (!Wanghl_gallery || Wanghl_gallery.code !== 0 || !Wanghl_gallery.data) {
          throw new Error((Wanghl_gallery && Wanghl_gallery.msg) || '图文接口返回异常');
        }

        Wanghl_state.news = Wanghl_news.data.list || [];
        Wanghl_state.gallery = Wanghl_gallery.data.list || [];
        Wanghl_state.loaded = true;

        Wanghl_renderFeed();
        Wanghl_renderHot();
      })
      .catch(function (Wanghl_err) {
        console.error('[Wanghl] 首页信息流加载失败：', Wanghl_err);
        Wanghl_showState('信息流加载失败：' + Wanghl_err.message + '，请确认后端服务已启动。', true);
        Wanghl_countEl.textContent = '加载失败';
        Wanghl_renderHot();
      });
  }

  Wanghl_tabsEl.addEventListener('click', function (Wanghl_event) {
    var Wanghl_btn = Wanghl_event.target.closest('.Wanghl_feed-tab');
    if (!Wanghl_btn || Wanghl_btn.classList.contains('is-active')) return;

    Wanghl_tabsEl.querySelectorAll('.Wanghl_feed-tab').forEach(function (Wanghl_tab) {
      Wanghl_tab.classList.toggle('is-active', Wanghl_tab === Wanghl_btn);
    });

    Wanghl_state.tab = Wanghl_btn.dataset.tab || 'recommend';
    console.log('[Wanghl] 切换信息流分类：', Wanghl_state.tab);

    if (Wanghl_state.loaded) {
      Wanghl_renderFeed();
    } else {
      Wanghl_loadFeed();
    }
  });

  Wanghl_loadFeed();
})();
