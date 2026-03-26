# Remaining Search Entry Audit

Review date: 2026-03-25

Purpose:

- explain why some `contents.ts` items still use Bilibili search URLs
- separate `usable candidate direct links` from `search entries we should keep`
- record what queries were used so a later review can tell whether the situation changed

Legend:

- `[候选但保留搜索]`: there is at least one usable public BV page, but we are not promoting it yet because representativeness or play-count signal is still weak
- `[结构性]`: this is not a problem likely to be solved by one more search pass; the search entry exists because there is no honest single-Bilibili-creator page to bind, or because direct-link duplication would reduce content variety
- `[可改善]`: current public search did not surface a stable direct page, but future platform indexing or creator updates may improve this

Important clarification:

- The direct links discussed here are candidate `recommended video` links, not creator homepage links.
- Some search entries intentionally point to topic search results because that is more honest than pretending we have a stable, representative single-video recommendation.

## Candidate But Keep Search

- `content_zlx_02` | 发球步伐：上步发球的正确节奏
  Tag: `[候选但保留搜索]`
  Search used: `奥斯汀-冬令营 上步发球 节奏 网球`
  Observed result: same-creator public BV candidate exists and is usable, but the current candidate still feels more adjacent than definitive.
  Evidence: https://www.bilibili.com/video/BV12P411v7Xr/
  Current decision: keep search until a stronger / more representative public page is manually chosen.

- `content_zlx_03` | 基本功细节：反手与中前场连接
  Tag: `[候选但保留搜索]`
  Search used: `松尾友贵Pro 反手 上网 过渡 网球`
  Observed result: creator has valid public teaching pages and adjacent-topic candidates, but current candidates do not yet clear the final curated-video bar.
  Evidence: https://www.bilibili.com/video/BV1TBQJYgEqF/
  Evidence: https://www.bilibili.com/video/BV18xXgYnEMA/
  Current decision: keep search until a clearer, more directly matched page is manually chosen.

- `content_common_03` | 反手切削总飘：拍面和送拍方向
  Tag: `[候选但保留搜索]`
  Search used: `松尾友贵Pro 反手 切削 控制 网球`
  Observed result: same creator, valid public technical pages, but current candidates still feel adjacent rather than ideal as the official slice-specific recommendation.
  Evidence: https://www.bilibili.com/video/BV1TBQJYgEqF/
  Evidence: https://www.bilibili.com/video/BV18xXgYnEMA/
  Current decision: keep search until a stronger slice-specific page is manually chosen.

## Keep Search

- `content_cn_a_01` | 反手总下网：先别急着加力
  Tag: `[可改善]`
  Search used: `是佩恩呀 反手 下网 网球`
  Observed result: public search did not stably surface a creator-specific Bilibili page strong enough to pin as the final direct recommendation.

- `content_cn_a_02` | 击球点总晚：如何更早准备
  Tag: `[可改善]`
  Search used: `是佩恩呀 击球点 晚 准备 网球`
  Observed result: results drift away from a stable creator-specific teaching page.

- `content_common_02` | 不会打下旋来球：击球点别掉到身后
  Tag: `[可改善]`
  Search used: `是佩恩呀 下旋 来球 击球点 网球`
  Observed result: current public search did not yield a stable direct page with enough confidence to replace search.

- `content_cn_b_01` | 双打网前：先学会站住和挡住
  Tag: `[结构性]`
  Search used: `RacketBrothers 双打 网前 封网 截击`
  Observed result: an existing direct RacketBrothers BV already covers the same zone, so adding another direct URL here would likely duplicate creator coverage rather than increase variety.
  Existing direct creator evidence: https://www.bilibili.com/video/BV1954y147nF/

- `content_cn_b_02` | 双打站位：搭档间最基础的配合
  Tag: `[结构性]`
  Search used: `RacketBrothers 双打 站位 轮转 配合`
  Observed result: broad topic bucket; exact direct conversion would likely collapse into creator duplication instead of adding a genuinely different recommendation.

- `content_cn_b_03` | 截击动作：缩小动作提高成功率
  Tag: `[结构性]`
  Search used: `RacketBrothers 截击 动作 缩小 挥拍 网球`
  Observed result: same creator already has direct BV coverage in the library, so keeping search preserves topic breadth.
  Existing direct creator evidence: https://www.bilibili.com/video/BV1954y147nF/

- `content_cn_c_01` | 稳定性优先：先把球打深再谈发力
  Tag: `[结构性]`
  Search used: `网球 稳定性 打深 底线 深度`
  Observed result: this item is intentionally modeled as a generic coach-curated topic search entry; there is no honest single Bilibili creator identity being bound here.

- `content_common_01` | 不会打高球：先理解弧线和落点
  Tag: `[结构性]`
  Search used: `网球 高球 弧线 落点 防守`
  Observed result: same issue as above; this is better represented as a generic curated search entry than as a fabricated creator-bound direct page.

- `content_cn_e_01` | 接发球太被动：先解决准备和站位
  Tag: `[结构性]`
  Search used: `网球 接发球 站位 准备`
  Observed result: this item is better modeled as a generic coach-curated search entry instead of pretending there is a real Bilibili creator profile to bind.

- `content_cn_e_02` | 比赛开局别乱：先把发接发流程固定住
  Tag: `[结构性]`
  Search used: `网球 比赛 开局 发接发 流程`
  Observed result: this topic is broad and public search is more honest than inventing a creator-bound direct recommendation.

- `content_cn_e_03` | 接发别抢着发力：先把第一拍稳稳送深
  Tag: `[结构性]`
  Search used: `网球 接发球 第一拍 送深`
  Observed result: same issue as above; this remains better represented as a generic coach-curated topic search entry.

- `content_cn_f_01` | 比赛紧张时别盯比分：把注意力拉回下一拍执行
  Tag: `[结构性]`
  Search used: `网球 比赛 紧张 执行 心态`
  Observed result: there is no honest single Bilibili creator identity bound here now, so a generic topic search is more truthful than a fabricated direct attribution.

- `content_cn_f_03` | 练得不少却没进步：先缩小目标
  Tag: `[结构性]`
  Search used: `网球 练了很多 没进步 训练 聚焦`
  Observed result: same as above; this now intentionally remains a generic curated search entry rather than a nonexistent creator-bound item.

## Practical Next Pass

- First revisit `content_zlx_02`, `content_zlx_03`, and `content_common_03` if play count / representativeness stops being a blocker.
- Do not force direct links for the structural items above.
- If future review finds that a currently `[可改善]` item starts surfacing a stable creator-specific BV page, that item can move from search to direct without changing the curation standard.
