/*
 * 姓名：王慧琳 | 学号：24001010731 | 时间：2026-11-19 | 大模型：TRAE DeepSeek-V4.1-Flash
 */
(function () {
  'use strict';

  const Wanghl_gridEl = document.getElementById('Wanghl_galleryGrid');
  const Wanghl_totalEl = document.getElementById('Wanghl_galleryTotal');
  const Wanghl_searchForm = document.getElementById('Wanghl_gallerySearchForm');
  const Wanghl_keywordEl = document.getElementById('Wanghl_galleryKeyword');
  const Wanghl_catListEl = document.getElementById('Wanghl_galleryCatList');
  const Wanghl_pagerEl = document.getElementById('Wanghl_galleryPager');
  const Wanghl_prevBtn = document.getElementById('Wanghl_galleryPrev');
  const Wanghl_nextBtn = document.getElementById('Wanghl_galleryNext');
  const Wanghl_pageInfoEl = document.getElementById('Wanghl_galleryPageInfo');
  const Wanghl_apiLink = document.getElementById('Wanghl_galleryApiLink');
  const Wanghl_jsonToggle = document.getElementById('Wanghl_galleryJsonToggle');
  const Wanghl_jsonEl = document.getElementById('Wanghl_galleryJson');

  const Wanghl_state = {
    page: 1,
    pageSize: 8,
    category: '',
    keyword: '',
    totalPages: 1
  };

  let Wanghl_lastJson = '';

  function Wanghl_buildQuery() {
    const Wanghl_params = new URLSearchParams();
    Wanghl_params.set('page', String(Wanghl_state.page));
    Wanghl_params.set('pageSize', String(Wanghl_state.pageSize));
    if (Wanghl_state.category) {
      Wanghl_params.set('category', Wanghl_state.category);
    }
    if (Wanghl_state.keyword) {
      Wanghl_params.set('keyword', Wanghl_state.keyword);
    }
    return Wanghl_params.toString();
  }

  function Wanghl_formatCount(Wanghl_num) {
    return (Number(Wanghl_num) || 0).toLocaleString('zh-CN');
  }

  function Wanghl_showSkeleton() {
    Wanghl_gridEl.textContent = '';
    for (let Wanghl_i = 0; Wanghl_i < 4; Wanghl_i++) {
      const Wanghl_li = document.createElement('li');
      Wanghl_li.className = 'Wanghl_gallery-skeleton';

      const Wanghl_media = document.createElement('div');
      Wanghl_media.className = 'Wanghl_gallery-skeleton-media';

      const Wanghl_body = document.createElement('div');
      Wanghl_body.className = 'Wanghl_gallery-skeleton-body';

      const Wanghl_t1 = document.createElement('div');
      Wanghl_t1.className = 'Wanghl_skeleton-line Wanghl_skeleton-line--title';

      const Wanghl_t2 = document.createElement('div');
      Wanghl_t2.className = 'Wanghl_skeleton-line Wanghl_skeleton-line--short';

      Wanghl_body.appendChild(Wanghl_t1);
      Wanghl_body.appendChild(Wanghl_t2);
      Wanghl_li.appendChild(Wanghl_media);
      Wanghl_li.appendChild(Wanghl_body);
      Wanghl_gridEl.appendChild(Wanghl_li);
    }
  }

  function Wanghl_showState(Wanghl_text, Wanghl_isError) {
    Wanghl_gridEl.textContent = '';
    const Wanghl_li = document.createElement('li');
    Wanghl_li.className = 'Wanghl_state' + (Wanghl_isError ? ' Wanghl_state--error' : '');
    Wanghl_li.style.gridColumn = '1 / -1';

    const Wanghl_p = document.createElement('p');
    Wanghl_p.textContent = Wanghl_text;
    Wanghl_li.appendChild(Wanghl_p);

    if (Wanghl_isError) {
      const Wanghl_retry = document.createElement('button');
      Wanghl_retry.className = 'Wanghl_state-btn';
      Wanghl_retry.type = 'button';
      Wanghl_retry.textContent = '重新加载';
      Wanghl_retry.addEventListener('click', function () {
        Wanghl_loadGallery();
      });
      Wanghl_li.appendChild(Wanghl_retry);
    }

    Wanghl_gridEl.appendChild(Wanghl_li);
  }

  function Wanghl_createCard(Wanghl_item, Wanghl_index) {
    const Wanghl_li = document.createElement('li');
    Wanghl_li.className = 'Wanghl_gallery-card';
    Wanghl_li.style.animationDelay = Math.min(Wanghl_index * 50, 300) + 'ms';

    const Wanghl_media = document.createElement('div');
    Wanghl_media.className = 'Wanghl_gallery-media';

    const Wanghl_img = document.createElement('img');
    Wanghl_img.src = Wanghl_item.imageUrl;
    Wanghl_img.alt = Wanghl_item.imageAlt || Wanghl_item.title;
    Wanghl_img.loading = 'lazy';
    Wanghl_img.decoding = 'async';
    Wanghl_img.addEventListener('error', function () {
      Wanghl_img.style.display = 'none';
      Wanghl_media.classList.add('Wanghl_gallery-media--fallback');
      console.error('[Wanghl] 图片加载失败：', Wanghl_item.imageUrl);
    });

    const Wanghl_cat = document.createElement('span');
    Wanghl_cat.className = 'Wanghl_gallery-cat';
    Wanghl_cat.textContent = Wanghl_item.category;

    Wanghl_media.appendChild(Wanghl_img);
    Wanghl_media.appendChild(Wanghl_cat);

    const Wanghl_body = document.createElement('div');
    Wanghl_body.className = 'Wanghl_gallery-body';

    const Wanghl_title = document.createElement('h3');
    Wanghl_title.className = 'Wanghl_gallery-title';
    Wanghl_title.textContent = Wanghl_item.title;

    const Wanghl_desc = document.createElement('p');
    Wanghl_desc.className = 'Wanghl_gallery-desc';
    Wanghl_desc.textContent = Wanghl_item.description;

    const Wanghl_meta = document.createElement('div');
    Wanghl_meta.className = 'Wanghl_gallery-meta';

    const Wanghl_source = document.createElement('span');
    Wanghl_source.textContent = '来源：';
    const Wanghl_sourceStrong = document.createElement('strong');
    Wanghl_sourceStrong.textContent = Wanghl_item.source;
    Wanghl_source.appendChild(Wanghl_sourceStrong);

    const Wanghl_author = document.createElement('span');
    Wanghl_author.textContent = '作者：';
    const Wanghl_authorStrong = document.createElement('strong');
    Wanghl_authorStrong.textContent = Wanghl_item.author;
    Wanghl_author.appendChild(Wanghl_authorStrong);

    const Wanghl_location = document.createElement('span');
    Wanghl_location.textContent = Wanghl_item.location;

    const Wanghl_time = document.createElement('span');
    Wanghl_time.textContent = Wanghl_item.publishTime;

    const Wanghl_like = document.createElement('span');
    Wanghl_like.className = 'Wanghl_gallery-like';
    Wanghl_like.textContent = '♥ ' + Wanghl_formatCount(Wanghl_item.likeCount);

    Wanghl_meta.appendChild(Wanghl_source);
    Wanghl_meta.appendChild(Wanghl_author);
    Wanghl_meta.appendChild(Wanghl_location);
    Wanghl_meta.appendChild(Wanghl_time);
    Wanghl_meta.appendChild(Wanghl_like);

    Wanghl_body.appendChild(Wanghl_title);
    Wanghl_body.appendChild(Wanghl_desc);
    Wanghl_body.appendChild(Wanghl_meta);

    Wanghl_li.appendChild(Wanghl_media);
    Wanghl_li.appendChild(Wanghl_body);

    return Wanghl_li;
  }

  function Wanghl_renderList(Wanghl_list) {
    Wanghl_gridEl.textContent = '';

    if (!Wanghl_list.length) {
      Wanghl_showState('没有找到符合条件的图文，试试更换分类或关键词。', false);
      return;
    }

    Wanghl_list.forEach(function (Wanghl_item, Wanghl_index) {
      Wanghl_gridEl.appendChild(Wanghl_createCard(Wanghl_item, Wanghl_index));
    });
  }

  function Wanghl_renderCategories(Wanghl_categories, Wanghl_total) {
    Wanghl_catListEl.textContent = '';

    const Wanghl_allItem = document.createElement('li');
    const Wanghl_allBtn = document.createElement('button');
    Wanghl_allBtn.type = 'button';
    Wanghl_allBtn.className = 'Wanghl_cat-btn' + (Wanghl_state.category === '' ? ' Wanghl_cat-btn--active' : '');
    Wanghl_allBtn.textContent = '全部';
    const Wanghl_allCount = document.createElement('span');
    Wanghl_allCount.className = 'Wanghl_cat-count';
    Wanghl_allCount.textContent = String(Wanghl_total);
    Wanghl_allBtn.appendChild(Wanghl_allCount);
    Wanghl_allBtn.addEventListener('click', function () {
      Wanghl_state.category = '';
      Wanghl_state.page = 1;
      Wanghl_loadGallery();
    });
    Wanghl_allItem.appendChild(Wanghl_allBtn);
    Wanghl_catListEl.appendChild(Wanghl_allItem);

    Wanghl_categories.forEach(function (Wanghl_cat) {
      const Wanghl_li = document.createElement('li');
      const Wanghl_btn = document.createElement('button');
      Wanghl_btn.type = 'button';
      Wanghl_btn.className = 'Wanghl_cat-btn' + (Wanghl_state.category === Wanghl_cat.category ? ' Wanghl_cat-btn--active' : '');
      Wanghl_btn.textContent = Wanghl_cat.category;

      const Wanghl_count = document.createElement('span');
      Wanghl_count.className = 'Wanghl_cat-count';
      Wanghl_count.textContent = String(Wanghl_cat.count);
      Wanghl_btn.appendChild(Wanghl_count);

      Wanghl_btn.addEventListener('click', function () {
        Wanghl_state.category = Wanghl_cat.category;
        Wanghl_state.page = 1;
        Wanghl_loadGallery();
      });

      Wanghl_li.appendChild(Wanghl_btn);
      Wanghl_catListEl.appendChild(Wanghl_li);
    });
  }

  function Wanghl_renderPager(Wanghl_page, Wanghl_totalPages) {
    Wanghl_state.totalPages = Wanghl_totalPages;
    Wanghl_pagerEl.hidden = Wanghl_totalPages <= 1;
    Wanghl_pageInfoEl.textContent = '第 ' + Wanghl_page + ' / ' + Wanghl_totalPages + ' 页';
    Wanghl_prevBtn.disabled = Wanghl_page <= 1;
    Wanghl_nextBtn.disabled = Wanghl_page >= Wanghl_totalPages;
  }

  function Wanghl_loadGallery() {
    Wanghl_showSkeleton();
    Wanghl_totalEl.textContent = '加载中…';

    const Wanghl_query = Wanghl_buildQuery();
    const Wanghl_path = '/api/gallery?' + Wanghl_query;
    const Wanghl_url = Wanghl_apiUrl(Wanghl_path);

    if (Wanghl_apiLink) {
      Wanghl_apiLink.href = Wanghl_url;
      Wanghl_apiLink.textContent = 'GET ' + Wanghl_path;
    }

    console.log('[Wanghl] 请求图文接口：', Wanghl_url);

    fetch(Wanghl_url)
      .then(function (Wanghl_res) {
        return Wanghl_res.json();
      })
      .then(function (Wanghl_data) {
        console.log('[Wanghl] /api/gallery 响应：', Wanghl_data);

        if (!Wanghl_data || Wanghl_data.code !== 0 || !Wanghl_data.data) {
          throw new Error((Wanghl_data && Wanghl_data.msg) || '接口返回数据异常');
        }

        const Wanghl_payload = Wanghl_data.data;
        Wanghl_lastJson = JSON.stringify(Wanghl_data, null, 2);
        if (Wanghl_jsonEl && !Wanghl_jsonEl.hidden) {
          Wanghl_jsonEl.textContent = Wanghl_lastJson;
        }

        Wanghl_totalEl.textContent = '共 ' + Wanghl_payload.total + ' 条';
        Wanghl_renderList(Wanghl_payload.list);
        Wanghl_renderCategories(Wanghl_payload.categories || [], Wanghl_payload.total);
        Wanghl_renderPager(Wanghl_payload.page, Wanghl_payload.totalPages);
      })
      .catch(function (Wanghl_err) {
        console.error('[Wanghl] 图文接口请求失败：', Wanghl_err);
        Wanghl_totalEl.textContent = '加载失败';
        Wanghl_pagerEl.hidden = true;
        Wanghl_showState('图文数据加载失败：' + Wanghl_err.message, true);
      });
  }

  Wanghl_searchForm.addEventListener('submit', function (Wanghl_event) {
    Wanghl_event.preventDefault();
    Wanghl_state.keyword = Wanghl_keywordEl.value.trim();
    Wanghl_state.page = 1;
    Wanghl_loadGallery();
  });

  Wanghl_prevBtn.addEventListener('click', function () {
    if (Wanghl_state.page > 1) {
      Wanghl_state.page -= 1;
      Wanghl_loadGallery();
    }
  });

  Wanghl_nextBtn.addEventListener('click', function () {
    if (Wanghl_state.page < Wanghl_state.totalPages) {
      Wanghl_state.page += 1;
      Wanghl_loadGallery();
    }
  });

  Wanghl_jsonToggle.addEventListener('click', function () {
    const Wanghl_hidden = Wanghl_jsonEl.hidden;
    Wanghl_jsonEl.hidden = !Wanghl_hidden;
    if (Wanghl_hidden) {
      Wanghl_jsonEl.textContent = Wanghl_lastJson || '暂无数据，请先加载列表';
    }
    Wanghl_jsonToggle.textContent = Wanghl_hidden ? '收起原始 JSON' : '查看当前请求的原始 JSON';
  });

  Wanghl_loadGallery();
})();
