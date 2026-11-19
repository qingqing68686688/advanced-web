/*
 * 姓名：王慧琳 | 学号：24001010731 | 时间：2026-11-19 | 大模型：TRAE DeepSeek-V4.1-Flash
 */
const Wanghl_pool = require('../config/db');

// 查询图文列表（支持分类筛选、关键词搜索与分页）
async function Wanghl_findGallery(Wanghl_options) {
  const Wanghl_page = Wanghl_options.page;
  const Wanghl_pageSize = Wanghl_options.pageSize;
  const Wanghl_category = Wanghl_options.category;
  const Wanghl_keyword = Wanghl_options.keyword;

  const Wanghl_conditions = [];
  const Wanghl_params = [];

  if (Wanghl_category) {
    Wanghl_conditions.push('Wanghl_category = ?');
    Wanghl_params.push(Wanghl_category);
  }

  if (Wanghl_keyword) {
    Wanghl_conditions.push('(Wanghl_title LIKE ? OR Wanghl_description LIKE ?)');
    Wanghl_params.push('%' + Wanghl_keyword + '%', '%' + Wanghl_keyword + '%');
  }

  const Wanghl_where = Wanghl_conditions.length ? ' WHERE ' + Wanghl_conditions.join(' AND ') : '';

  const [Wanghl_countRows] = await Wanghl_pool.query(
    'SELECT COUNT(*) AS total FROM Wanghl_gallery_items' + Wanghl_where,
    Wanghl_params
  );

  const Wanghl_offset = (Wanghl_page - 1) * Wanghl_pageSize;

  const [Wanghl_rows] = await Wanghl_pool.query(
    'SELECT Wanghl_id AS id, Wanghl_title AS title, Wanghl_description AS description, ' +
      'Wanghl_image_url AS imageUrl, Wanghl_image_alt AS imageAlt, ' +
      'Wanghl_category AS category, Wanghl_source AS source, Wanghl_author AS author, ' +
      'Wanghl_location AS location, Wanghl_view_count AS viewCount, Wanghl_like_count AS likeCount, ' +
      "DATE_FORMAT(Wanghl_publish_time, '%Y-%m-%d %H:%i:%s') AS publishTime " +
      'FROM Wanghl_gallery_items' + Wanghl_where +
      ' ORDER BY Wanghl_publish_time DESC, Wanghl_id DESC LIMIT ? OFFSET ?',
    Wanghl_params.concat([Wanghl_pageSize, Wanghl_offset])
  );

  return {
    list: Wanghl_rows,
    total: Wanghl_countRows[0].total
  };
}

// 查询全部分类及数量
async function Wanghl_findCategories() {
  const [Wanghl_rows] = await Wanghl_pool.query(
    'SELECT Wanghl_category AS category, COUNT(*) AS count FROM Wanghl_gallery_items ' +
      'GROUP BY Wanghl_category ORDER BY count DESC, Wanghl_category ASC'
  );
  return Wanghl_rows;
}

module.exports = {
  Wanghl_findGallery,
  Wanghl_findCategories
};
