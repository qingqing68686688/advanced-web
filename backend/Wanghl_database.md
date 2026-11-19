-- 数据库建表与数据记录（按执行顺序追加）
-- 暂无数据表

-- ============================================================
-- 2026-11-19 科技新闻功能：创建数据库、数据表并写入测试数据
-- 执行方式：node backend/scripts/Wanghl_initDatabase.js
-- ============================================================

CREATE DATABASE IF NOT EXISTS `Wanghl_zhihu`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `Wanghl_zhihu`;

CREATE TABLE IF NOT EXISTS `Wanghl_tech_news` (
  `Wanghl_id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '新闻ID',
  `Wanghl_title` VARCHAR(200) NOT NULL COMMENT '标题',
  `Wanghl_summary` VARCHAR(500) NOT NULL COMMENT '摘要',
  `Wanghl_content` TEXT COMMENT '正文',
  `Wanghl_source` VARCHAR(100) NOT NULL COMMENT '来源',
  `Wanghl_author` VARCHAR(50) NOT NULL COMMENT '作者',
  `Wanghl_category` VARCHAR(50) NOT NULL COMMENT '分类',
  `Wanghl_tags` VARCHAR(200) NOT NULL DEFAULT '' COMMENT '标签，逗号分隔',
  `Wanghl_view_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览量',
  `Wanghl_publish_time` DATETIME NOT NULL COMMENT '发布时间',
  `Wanghl_created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`Wanghl_id`),
  KEY `idx_Wanghl_publish_time` (`Wanghl_publish_time`),
  KEY `idx_Wanghl_category` (`Wanghl_category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='科技新闻表';

INSERT INTO `Wanghl_tech_news`
  (`Wanghl_title`, `Wanghl_summary`, `Wanghl_content`, `Wanghl_source`, `Wanghl_author`, `Wanghl_category`, `Wanghl_tags`, `Wanghl_view_count`, `Wanghl_publish_time`)
VALUES
('多模态大模型推理成本再降四成，端侧部署成为新战场', '多家厂商公布新一代多模态模型，通过量化与蒸馏把推理成本压低约四成，手机与车机成为落地重点。', '新一代多模态模型在图文理解、语音交互上的表现继续提升。与上一代相比，厂商更强调端侧部署能力：通过混合精度量化、结构化剪枝与知识蒸馏，把推理成本压低约四成，同时保持主要能力不下降。业内认为，端侧推理不仅能降低云端成本，也能改善隐私与响应时延，但模型压缩后的稳定性仍需长期验证。', '智源观察', '林晓舟', '人工智能', '大模型,端侧推理', 12840, '2026-11-19 09:20:00'),
('国产 3nm 制程工艺进入风险试产阶段', '产业链消息显示，国产 3nm 制程已完成关键工艺验证，开始小批量风险试产，良率仍在爬坡。', '据产业链人士透露，国产 3nm 制程已完成关键工艺验证，进入小批量风险试产阶段。当前重点在于提升良率与稳定性，设备、材料与封装的协同仍是难点。分析认为，风险试产到规模量产通常需要数个季度，短期内产能有限，但对本土高端芯片供应链具有标志性意义。', '芯闻社', '周启明', '芯片半导体', '先进制程,晶圆制造', 9650, '2026-11-18 16:05:00'),
('量子纠错取得进展：逻辑量子比特错误率首次低于物理比特', '研究团队在超导体系上验证了新的纠错编码方案，逻辑量子比特错误率低于单个物理比特。', '研究团队在超导量子平台上验证了一种新的表面码纠错方案，实验显示逻辑量子比特的错误率首次稳定低于单个物理比特。这一结果意味着增加物理比特数量可以真正换来更可靠的逻辑比特，为后续扩展铺路。团队同时指出，实验仍受制冷与读取效率限制，距离实用化还有距离。', '前沿科学周刊', '陈慕白', '量子计算', '量子纠错,超导', 7320, '2026-11-18 08:40:00'),
('城市 NOA 开放范围扩大，多家车企推送无图方案', '多家车企在同一周内扩大城市领航辅助驾驶开放城市，无图方案成为主流技术路线。', '多家车企在同一周内宣布扩大城市领航辅助驾驶的开放范围，覆盖城市数量明显增加。与依赖高精地图的方案不同，新版本普遍采用无图或轻图路线，依靠车端感知与在线建图完成路口通行。用户反馈显示，复杂路口的通行成功率仍是体验分水岭，接管率数据成为厂商比拼重点。', '出行前沿', '赵一鸣', '智能汽车', '辅助驾驶,NOA', 15420, '2026-11-17 19:15:00'),
('低轨卫星互联网完成新一轮组网发射', '新一轮低轨卫星成功入轨，星座在轨数量进一步增加，偏远地区宽带覆盖能力持续提升。', '新一轮低轨通信卫星顺利入轨，星座在轨数量进一步增加。运营方表示，随着卫星数量与地面关口站同步扩充，偏远地区与海上场景的宽带覆盖能力持续提升。终端方面，车载与船载终端的体积和功耗正在下降，资费方案也在逐步细化。', '星空简报', '孙可', '空间科技', '卫星互联网,低轨', 6890, '2026-11-17 11:30:00'),
('折叠屏铰链寿命突破 50 万次，轻薄化成主旋律', '新一代折叠屏铰链通过结构优化把开合寿命提升至 50 万次，整机厚度与重量继续下探。', '新一代折叠屏手机在铰链结构上采用多连杆与液态金属组合方案，官方测试开合寿命突破 50 万次。与此同时，电池与散热堆叠的优化让整机厚度和重量继续下探。行业分析认为，折痕控制与耐用性仍是用户最关心的指标，维修成本也会影响换机决策。', '数码新语', '何雨桐', '消费电子', '折叠屏,铰链', 8430, '2026-11-16 14:50:00'),
('开源数据库社区发布新一代分布式事务引擎', '新引擎在跨地域场景下优化了两阶段提交流程，官方基准测试显示事务延迟明显下降。', '开源数据库社区发布了新一代分布式事务引擎，重点优化跨地域场景下的两阶段提交流程，通过并行准备与自适应提交减少协调开销。官方基准测试显示，高并发写入下的事务延迟明显下降。社区同时公布了升级路径，建议生产环境先在灰度集群验证兼容性。', '开源观察', '吴亦然', '开源生态', '数据库,分布式事务', 5120, '2026-11-15 10:10:00'),
('零信任架构落地加速，企业身份安全投入持续增长', '调研显示超过六成受访企业已启动零信任改造，身份治理与终端可信成为投入重点。', '最新调研显示，超过六成受访企业已启动零信任架构改造，其中身份治理、终端可信与微隔离是投入重点。受访安全负责人普遍认为，改造难点不在产品采购，而在权限梳理与业务流程重构。随着远程办公常态化，持续验证与最小权限原则正在成为默认配置。', '安全内参', '郑清和', '网络安全', '零信任,身份安全', 4380, '2026-11-14 17:25:00'),
('AI 编程助手进入“仓库级”理解阶段，代码评审效率提升', '新一代编程助手开始支持仓库级上下文检索，能跨文件追踪调用链，评审建议更贴近工程实践。', '新一代 AI 编程助手开始支持仓库级上下文检索，可跨文件追踪函数调用与数据流向，并据此给出修改建议。开发者反馈显示，这类工具在缺陷定位与测试补全上收益明显，但生成的补丁仍需人工复核。厂商正在补充权限控制与审计能力，以满足企业代码安全要求。', '开发者日报', '林晓舟', '人工智能', 'AI编程,代码评审', 11260, '2026-11-13 09:45:00'),
('空间计算设备出货量回升，开发者生态逐步完善', '市场机构数据显示，空间计算设备出货量连续两个季度回升，消费级与企业级市场同步改善。应用侧，手势与眼动交互的原生应用数量增长明显，办公协作与三维设计成为主要场景。业内认为，佩戴舒适度与内容供给仍是决定行业增速的关键因素。', '数码新语', '何雨桐', '消费电子', '空间计算,XR', 6040, '2026-11-12 15:35:00');

-- ============================================================
-- 2026-11-19 图文列表功能：创建图文数据表并写入测试数据
-- 执行方式：node backend/scripts/Wanghl_initDatabase.js
-- ============================================================

USE `Wanghl_zhihu`;

CREATE TABLE IF NOT EXISTS `Wanghl_gallery_items` (
  `Wanghl_id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '图文ID',
  `Wanghl_title` VARCHAR(200) NOT NULL COMMENT '标题',
  `Wanghl_description` VARCHAR(500) NOT NULL COMMENT '描述',
  `Wanghl_image_url` VARCHAR(500) NOT NULL COMMENT '图片地址',
  `Wanghl_image_alt` VARCHAR(200) NOT NULL DEFAULT '' COMMENT '图片替代文本',
  `Wanghl_category` VARCHAR(50) NOT NULL COMMENT '分类',
  `Wanghl_source` VARCHAR(100) NOT NULL COMMENT '来源',
  `Wanghl_author` VARCHAR(50) NOT NULL COMMENT '作者',
  `Wanghl_location` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '拍摄地点',
  `Wanghl_view_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览量',
  `Wanghl_like_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '点赞数',
  `Wanghl_publish_time` DATETIME NOT NULL COMMENT '发布时间',
  `Wanghl_created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`Wanghl_id`),
  KEY `idx_Wanghl_gallery_publish_time` (`Wanghl_publish_time`),
  KEY `idx_Wanghl_gallery_category` (`Wanghl_category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='图文列表数据表';

INSERT INTO `Wanghl_gallery_items`
  (`Wanghl_title`, `Wanghl_description`, `Wanghl_image_url`, `Wanghl_image_alt`, `Wanghl_category`, `Wanghl_source`, `Wanghl_author`, `Wanghl_location`, `Wanghl_view_count`, `Wanghl_like_count`, `Wanghl_publish_time`)
VALUES
('夜色中的智算中心：万卡集群如何降温', '探访新一代智算中心机房，液冷与余热回收成为降低 PUE 的关键手段。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20AI%20data%20center%20interior%2C%20rows%20of%20server%20racks%20with%20blue%20LED%20lights%2C%20cinematic%20lighting%2C%20photorealistic%2C%20high%20detail&image_size=landscape_4_3', '智算中心机房内部', '人工智能', '智源观察', '林晓舟', '北京·亦庄', 18620, 742, '2026-11-19 10:15:00'),
('走进晶圆厂洁净室：一片硅片的诞生', '从光刻到封装，洁净室内的每一道工序都对环境洁净度有着极高要求。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=semiconductor%20fabrication%20cleanroom%2C%20engineer%20in%20white%20cleanroom%20suit%20inspecting%20silicon%20wafer%2C%20blue%20ambient%20light%2C%20photorealistic&image_size=landscape_4_3', '晶圆厂洁净室', '芯片半导体', '芯闻社', '周启明', '上海·张江', 14230, 566, '2026-11-18 15:40:00'),
('稀释制冷机内部：量子计算的极寒世界', '接近绝对零度的环境里，量子比特才能保持足够的相干时间。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=quantum%20computing%20laboratory%2C%20golden%20cryostat%20dilution%20refrigerator%2C%20scientists%20observing%20monitors%2C%20cool%20blue%20tones%2C%20photorealistic&image_size=landscape_4_3', '量子计算实验室中的稀释制冷机', '量子计算', '前沿科学周刊', '陈慕白', '合肥', 9860, 431, '2026-11-18 09:05:00'),
('城市道路上的无人驾驶测试车', '车顶激光雷达与多路摄像头协同，构成感知系统的第一道防线。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=autonomous%20electric%20car%20driving%20through%20modern%20city%20street%20at%20dusk%2C%20lidar%20sensors%20on%20roof%2C%20motion%20blur%2C%20cinematic%2C%20photorealistic&image_size=landscape_4_3', '城市道路上的无人驾驶测试车', '智能汽车', '出行前沿', '赵一鸣', '深圳', 17340, 815, '2026-11-17 18:20:00'),
('低轨星座掠过晨昏线', '卫星在晨昏轨道运行时，太阳能板几乎可以持续获得光照。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=low%20earth%20orbit%20satellite%20constellation%20above%20earth%2C%20sunrise%20over%20the%20planet%2C%20stars%20and%20blue%20atmosphere%2C%20photorealistic%20space%20photography&image_size=landscape_4_3', '低轨卫星星座', '空间科技', '星空简报', '孙可', '太原卫星发射中心', 7650, 302, '2026-11-17 07:50:00'),
('折叠屏铰链的结构之美', '多连杆结构与液态金属的组合，让屏幕在展开时几乎看不到折痕。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=close%20up%20of%20a%20foldable%20smartphone%20hinge%20mechanism%20on%20a%20clean%20desk%2C%20soft%20studio%20lighting%2C%20product%20photography%2C%20minimalist&image_size=landscape_4_3', '折叠屏手机铰链细节', '消费电子', '数码新语', '何雨桐', '东莞', 11280, 624, '2026-11-16 16:30:00'),
('开源社区的线下聚会', '开发者围绕分布式事务引擎的升级路径展开讨论，现场演示了灰度方案。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=developer%20community%20meetup%20in%20a%20bright%20modern%20office%2C%20people%20discussing%20around%20laptops%20and%20whiteboard%2C%20warm%20lighting%2C%20candid%20photography&image_size=landscape_4_3', '开源社区开发者聚会', '开源生态', '开源观察', '吴亦然', '杭州', 6420, 358, '2026-11-15 19:00:00'),
('安全运营中心的深夜值守', '大屏实时滚动告警，分析师需要在分钟级完成研判与处置。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cybersecurity%20operations%20center%20with%20large%20screens%20showing%20network%20maps%20and%20alerts%2C%20analysts%20at%20workstations%2C%20dark%20blue%20lighting%2C%20photorealistic&image_size=landscape_4_3', '安全运营中心', '网络安全', '安全内参', '郑清和', '北京·海淀', 5310, 214, '2026-11-14 22:10:00'),
('空间计算设备的日常使用场景', '手势与眼动交互让内容悬浮在真实空间中，办公与设计成为主要场景。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=person%20wearing%20a%20mixed%20reality%20headset%20in%20a%20sunlit%20modern%20living%20room%2C%20holographic%20interface%20floating%2C%20cinematic%2C%20photorealistic&image_size=landscape_4_3', '佩戴空间计算设备的用户', '消费电子', '数码新语', '何雨桐', '上海', 8940, 476, '2026-11-13 14:25:00'),
('智慧城市的夜间天际线', '交通、能源与安防数据在城市级平台上汇聚，形成实时运行视图。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic%20smart%20city%20skyline%20at%20blue%20hour%2C%20connected%20data%20visualization%20lines%20over%20buildings%2C%20aerial%20view%2C%20photorealistic&image_size=landscape_4_3', '智慧城市夜景', '人工智能', '智源观察', '林晓舟', '雄安新区', 10260, 512, '2026-11-12 20:45:00');
