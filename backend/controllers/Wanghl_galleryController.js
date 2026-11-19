/*
 * 姓名：王慧琳 | 学号：24001010731 | 时间：2026-11-19 | 大模型：TRAE DeepSeek-V4.1-Flash
 */
const Wanghl_galleryModel = require('../models/Wanghl_galleryModel');

function Wanghl_toInt(Wanghl_value, Wanghl_default) {
  const Wanghl_num = parseInt(Wanghl_value, 10);
  return Number.isFinite(Wanghl_num) && Wanghl_num > 0 ? Wanghl_num : Wanghl_default;
}

// GET /api/gallery 图文列表
async function Wanghl_getGalleryList(req, res) {
  const Wanghl_page = Wanghl_toInt(req.query.page, 1);
  const Wanghl_pageSize = Math.min(Wanghl_toInt(req.query.pageSize, 8), 40);
  const Wanghl_category = typeof req.query.category === 'string' ? req.query.category.trim().slice(0, 50) : '';
  const Wanghl_keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim().slice(0, 50) : '';

  try {
    const Wanghl_result = await Wanghl_galleryModel.Wanghl_findGallery({
      page: Wanghl_page,
      pageSize: Wanghl_pageSize,
      category: Wanghl_category,
      keyword: Wanghl_keyword
    });
    const Wanghl_categories = await Wanghl_galleryModel.Wanghl_findCategories();

    res.json({
      code: 0,
      msg: '获取图文列表成功',
      data: {
        list: Wanghl_result.list,
        total: Wanghl_result.total,
        page: Wanghl_page,
        pageSize: Wanghl_pageSize,
        totalPages: Math.ceil(Wanghl_result.total / Wanghl_pageSize) || 0,
        categories: Wanghl_categories,
        api: '/api/gallery'
      }
    });
  } catch (Wanghl_err) {
    console.error('[Wanghl] 查询图文列表失败：', Wanghl_err.message);
    res.json({
      code: 1,
      msg: '查询图文列表失败，请稍后重试',
      data: { detail: Wanghl_err.message }
    });
  }
}

module.exports = {
  Wanghl_getGalleryList
};
