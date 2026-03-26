# TennisLevel — 平台视频搜索集成任务包

> 目标：让诊断结果能实时从 Bilibili 和 YouTube 搜索相关教学视频，
> 补充现有静态内容库，提升推荐覆盖面和新鲜度。

---

## 任务 S1：诊断规则新增 searchQueries 字段

### 目标
每条诊断规则预设中英文搜索词，用于后续调用平台 API。

### 具体改动

在 `src/data/diagnosisRules.ts` 的类型定义中新增字段：

```typescript
interface DiagnosisRule {
  // ... 现有字段 ...
  searchQueries: {
    bilibili: string[];    // 中文搜索词，2-3 个
    youtube: string[];     // 英文搜索词，2-3 个
  };
}
```

为现有 19 条规则补充 searchQueries。以下是参考值（Codex 直接写入）：

```typescript
// 反手下网
searchQueries: {
  bilibili: ['反手下网 纠正', '反手总挂网 怎么练', '反手拍面控制 教学'],
  youtube: ['tennis backhand into net fix', 'backhand contact point correction', 'backhand net error drill'],
}

// 正手出界
searchQueries: {
  bilibili: ['正手出界 纠正', '正手弧线不够 怎么办', '正手上旋 教学'],
  youtube: ['tennis forehand going long fix', 'forehand topspin technique', 'forehand out control drill'],
}

// 发球没信心 / 二发
searchQueries: {
  bilibili: ['网球发球入门 教学', '二发没信心 怎么练', '发球稳定性 训练'],
  youtube: ['tennis second serve confidence', 'beginner serve technique', 'reliable second serve drill'],
}

// 比赛紧张
searchQueries: {
  bilibili: ['网球比赛紧张 怎么办', '比赛心态 调整', '网球比赛失误多'],
  youtube: ['tennis match nerves tips', 'how to stay calm tennis match', 'tennis mental game beginner'],
}

// 双打站位
searchQueries: {
  bilibili: ['双打站位 基础', '网球双打配合 教学', '双打一前一后 站位'],
  youtube: ['tennis doubles positioning basics', 'doubles formation beginner', 'doubles net play position'],
}

// 脚步慢 / 移动
searchQueries: {
  bilibili: ['网球脚步 训练', '分腿垫步 教学', '网球移动 基础'],
  youtube: ['tennis footwork drill beginner', 'split step timing tennis', 'tennis movement training'],
}

// 截击
searchQueries: {
  bilibili: ['网球截击 基础', '截击动作太大 纠正', '网前截击 教学'],
  youtube: ['tennis volley technique beginner', 'compact volley drill', 'net play basics tennis'],
}

// 接发球
searchQueries: {
  bilibili: ['接发球 被动 怎么办', '接发球站位 教学', '接发球回深 训练'],
  youtube: ['tennis return of serve tips', 'return position beginner', 'deep return drill tennis'],
}

// 不会自己练
searchQueries: {
  bilibili: ['网球自己练 方法', '没有教练怎么练球', '网球课后复习 训练'],
  youtube: ['tennis solo practice drills', 'how to practice tennis alone', 'tennis self training routine'],
}

// 没进步 / 瓶颈
searchQueries: {
  bilibili: ['网球瓶颈期 怎么突破', '练了很久没进步', '网球进步 方法'],
  youtube: ['tennis plateau how to improve', 'stuck at 3.0 tennis tips', 'tennis improvement strategy'],
}

// 正手上旋不够
searchQueries: {
  bilibili: ['正手上旋 怎么打', '正手弧线 教学', '正手提拉 训练'],
  youtube: ['tennis forehand topspin technique', 'how to hit topspin forehand', 'forehand spin drill'],
}

// 打不好下旋来球
searchQueries: {
  bilibili: ['下旋来球 怎么打', '对方切球 怎么接', '低球处理 教学'],
  youtube: ['tennis handle slice return', 'how to hit against slice', 'low ball tennis technique'],
}

// 高球不会打
searchQueries: {
  bilibili: ['网球高球 怎么打', '防守高球 教学', '网球挑高球 训练'],
  youtube: ['tennis defensive lob technique', 'how to hit a lob tennis', 'lob shot drill beginner'],
}

// 击球点偏晚
searchQueries: {
  bilibili: ['击球点偏晚 纠正', '准备太慢 怎么办', '击球点 提前'],
  youtube: ['tennis late contact point fix', 'early preparation tennis', 'tennis timing drill'],
}

// 正手没力量
searchQueries: {
  bilibili: ['正手没力量 怎么办', '正手发力链 教学', '正手转体发力'],
  youtube: ['tennis forehand power technique', 'forehand kinetic chain', 'generate power forehand'],
}

// 发球节奏
searchQueries: {
  bilibili: ['发球节奏 教学', '发球停顿 训练', '发球一发力就散'],
  youtube: ['tennis serve rhythm drill', 'serve toss timing', 'smooth serve motion tennis'],
}

// 反手与中前场衔接
searchQueries: {
  bilibili: ['反手接上网 教学', '中前场处理 训练', '反手到截击 衔接'],
  youtube: ['backhand approach shot tennis', 'transition to net tennis', 'backhand to volley drill'],
}
```

其余规则按同样模式补充。每条规则的 bilibili 和 youtube 各至少 2 个搜索词。

### 验收标准
- 所有 19 条规则都有 searchQueries 字段
- 每个平台至少 2 个搜索词
- TypeScript 编译无报错
- `npm run validate:data` 通过

---

## 任务 S2：创建视频搜索 API Route

### 目标
统一的后端接口，接收平台和关键词，返回标准化的视频搜索结果。

### 文件路径
`src/app/api/search-videos/route.ts`

### API 设计

**请求：**
```
POST /api/search-videos
{
  "platform": "bilibili" | "youtube",
  "query": "反手下网 纠正",
  "maxResults": 5
}
```

**响应：**
```typescript
interface SearchVideoResult {
  platform: 'bilibili' | 'youtube';
  videoId: string;           // BV号 或 YouTube video ID
  title: string;
  author: string;
  thumbnail: string;         // 缩略图 URL
  url: string;               // 完整的视频链接
  viewCount: number | null;  // 播放量（如果能获取）
  duration: string | null;   // 时长（如果能获取）
  publishedAt: string | null;// 发布时间
}

interface SearchVideosResponse {
  platform: string;
  query: string;
  results: SearchVideoResult[];
  cached: boolean;           // 是否来自缓存
}
```

### YouTube 实现

```typescript
async function searchYouTube(query: string, maxResults: number): Promise<SearchVideoResult[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn('YouTube API key not configured');
    return [];
  }

  const params = new URLSearchParams({
    key: apiKey,
    type: 'video',
    part: 'snippet',
    q: query,
    maxResults: String(maxResults),
    relevanceLanguage: query.match(/[\u4e00-\u9fff]/) ? 'zh' : 'en',
    // 如果是中文 query 搜中文结果，英文 query 搜英文结果
  });

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params.toString()}`
  );
  const data = await res.json();

  if (!data.items) return [];

  return data.items.map((item: any) => ({
    platform: 'youtube' as const,
    videoId: item.id.videoId,
    title: item.snippet.title,
    author: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.medium?.url || '',
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    viewCount: null,  // search endpoint 不返回播放量
    duration: null,
    publishedAt: item.snippet.publishedAt,
  }));
}
```

### Bilibili 实现

```typescript
async function searchBilibili(query: string, maxResults: number): Promise<SearchVideoResult[]> {
  // Bilibili web 搜索接口（非官方但稳定）
  const params = new URLSearchParams({
    search_type: 'video',
    keyword: query,
    page: '1',
    pagesize: String(maxResults),
    order: 'totalrank',  // 综合排序
  });

  try {
    const res = await fetch(
      `https://api.bilibili.com/x/web-interface/search/type?${params.toString()}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.bilibili.com',
        },
      }
    );
    const data = await res.json();

    if (!data.data?.result) return [];

    return data.data.result.slice(0, maxResults).map((item: any) => ({
      platform: 'bilibili' as const,
      videoId: item.bvid || item.aid?.toString(),
      title: item.title?.replace(/<[^>]+>/g, ''),  // 去掉高亮 HTML 标签
      author: item.author,
      thumbnail: item.pic?.startsWith('//') ? `https:${item.pic}` : item.pic,
      url: `https://www.bilibili.com/video/${item.bvid}`,
      viewCount: item.play || null,
      duration: item.duration || null,
      publishedAt: item.pubdate
        ? new Date(item.pubdate * 1000).toISOString()
        : null,
    }));
  } catch (error) {
    console.error('Bilibili search error:', error);
    return [];
  }
}
```

### 缓存层

```typescript
// 同样的 query + platform 组合，24 小时内只调一次真实 API
// 缓存存在内存 Map 中（serverless 环境下每次冷启动会清空，可接受）
// 后续可升级为 Supabase 缓存表

const cache = new Map<string, { data: SearchVideoResult[]; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 小时

function getCacheKey(platform: string, query: string): string {
  return `${platform}:${query}`;
}

function getFromCache(platform: string, query: string): SearchVideoResult[] | null {
  const key = getCacheKey(platform, query);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCache(platform: string, query: string, data: SearchVideoResult[]): void {
  const key = getCacheKey(platform, query);
  cache.set(key, { data, timestamp: Date.now() });
  // 防止内存泄漏：限制缓存条目数
  if (cache.size > 200) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
}
```

### 完整 Route 逻辑

```typescript
export async function POST(request: NextRequest) {
  try {
    const { platform, query, maxResults = 5 } = await request.json();

    if (!platform || !query) {
      return NextResponse.json(
        { error: 'platform and query are required' },
        { status: 400 }
      );
    }

    if (!['bilibili', 'youtube'].includes(platform)) {
      return NextResponse.json(
        { error: 'platform must be bilibili or youtube' },
        { status: 400 }
      );
    }

    // 检查缓存
    const cached = getFromCache(platform, query);
    if (cached) {
      return NextResponse.json({
        platform, query, results: cached, cached: true,
      });
    }

    // 调用真实 API
    let results: SearchVideoResult[];
    if (platform === 'youtube') {
      results = await searchYouTube(query, maxResults);
    } else {
      results = await searchBilibili(query, maxResults);
    }

    // 写入缓存
    setCache(platform, query, results);

    return NextResponse.json({
      platform, query, results, cached: false,
    });
  } catch (error) {
    console.error('Search videos error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
```

### 环境变量

```env
# .env.local 新增
YOUTUBE_API_KEY=your_youtube_data_api_v3_key_here
```

Bilibili 不需要 API key。

### 验收标准
- POST `/api/search-videos` 能正常返回结果
- YouTube 和 Bilibili 两个平台都能搜索
- 同样的请求第二次命中缓存
- 无 API key 时 YouTube 返回空数组而不是报错
- Bilibili 搜索结果的 title 不包含 HTML 标签

---

## 任务 S3：创建平台视频搜索前端组件

### 目标
在诊断结果页展示实时搜索到的平台视频，作为静态内容库的补充。

### 文件路径
`src/components/PlatformVideoSearch.tsx`

### 组件设计

```typescript
interface PlatformVideoSearchProps {
  queries: {
    bilibili: string[];
    youtube: string[];
  };
  title?: string;  // 默认 "更多相关视频"
}
```

### UI 结构

```
┌─────────────────────────────────────────┐
│  更多相关视频                              │
│                                         │
│  [Bilibili] [YouTube]    ← 平台切换 tab  │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 🎬 [缩略图] 正手下网纠正：三步搞定   │    │
│  │     网球工匠付锦 · 12.3万播放       │    │
│  │     → 点击在 Bilibili 观看         │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ 🎬 [缩略图] 发球入门完整教程        │    │
│  │     盖奥网球 · 8.7万播放            │    │
│  │     → 点击在 Bilibili 观看         │    │
│  └─────────────────────────────────┘    │
│                                         │
│  搜索词：反手下网 纠正                     │
│  换一批 ↻     ← 切换到下一个搜索词       │
└─────────────────────────────────────────┘
```

### 交互逻辑

1. 组件加载时，默认选中 Bilibili tab，使用第一个搜索词调用 `/api/search-videos`
2. 点击 YouTube tab 切换平台，使用对应的第一个搜索词
3. 点击"换一批"轮换到下一个搜索词重新搜索
4. 搜索中显示 loading skeleton（3 个占位卡片）
5. 搜索失败或无结果时显示"暂未搜索到相关视频"
6. 每个视频卡片点击后在新标签页打开外部链接
7. 记录事件日志：`logEvent('platform_search', { platform, query })`
8. 记录外链点击：`logEvent('platform_video_click', { platform, videoId, title })`

### 样式要求
- 卡片样式与现有内容卡片一致
- 缩略图 16:9 比例，圆角
- 平台 tab 用和首页标签一样的 pill 样式
- 视频标题最多显示 2 行，超出省略
- "换一批"用灰色小字链接

### 验收标准
- 两个平台 tab 都能正常展示搜索结果
- 搜索结果有缩略图、标题、作者、播放量
- 外部链接在新标签页打开
- loading 和 empty 状态都有处理
- 事件日志已埋点

---

## 任务 S4：诊断结果页集成平台搜索

### 目标
在诊断结果页的推荐内容区下方，增加实时平台搜索区块。

### 具体改动

在 `/diagnose` 结果页中，找到推荐内容列表的末尾，在其后插入：

```tsx
{matchedRule?.searchQueries && (
  <PlatformVideoSearch
    queries={matchedRule.searchQueries}
    title="在其他平台搜索更多"
  />
)}
```

### 页面布局

```
诊断结果页
├── AI 诊断结果（问题 + 原因 + 修正建议）
├── 推荐内容（来自静态内容库，带 coachReason）
├── 生成训练计划按钮
├── ─── 分隔线 ───
├── 🆕 在其他平台搜索更多 ← 新增区块
│   └── PlatformVideoSearch 组件
└── 还有其他问题？（继续诊断入口）
```

### 重要设计决策

静态内容库的推荐（带 coachReason）始终排在平台搜索结果之上。原因：
- 静态内容是你人工审核过的，质量有保证
- coachReason 是核心差异化
- 平台搜索结果是补充，不是替代

在区块标题旁加一行灰色小字说明：
"以下视频来自 Bilibili / YouTube 实时搜索，未经教练筛选，仅供参考。"

### 验收标准
- 诊断结果页有平台搜索区块
- 静态推荐在上，平台搜索在下
- 有"未经教练筛选"的提示
- 无匹配规则时不显示此区块

---

## 任务 S5：内容库页增加平台搜索入口

### 目标
用户在内容库页浏览时，可以直接搜索 Bilibili / YouTube。

### 具体改动

在 `/library` 页面顶部筛选栏下方，增加一个搜索框：

```
┌────────────────────────────────────┐
│ 🔍 在 Bilibili / YouTube 搜索...     │
│    [输入框]  [Bilibili] [YouTube]   │
│    [搜索]                           │
└────────────────────────────────────┘
```

### 交互逻辑

1. 用户输入关键词（中文或英文）
2. 选择平台（默认 Bilibili）
3. 点击搜索，调用 `/api/search-videos`
4. 搜索结果显示在现有内容列表上方，用不同的背景色区分
5. 搜索结果区有"清除搜索结果"按钮，点击后恢复为静态内容列表
6. 搜索结果区标题："来自 Bilibili 的搜索结果"

### 验收标准
- 搜索框可输入并触发搜索
- 搜索结果与静态内容视觉上有区分
- 可清除搜索结果回到静态列表

---

## 任务 S6：首页 Hero 区标签点击增加平台搜索

### 目标
用户在首页点击快捷标签后，除了跳到诊断页，也可以直接看到相关视频。

### 改动方式（二选一，建议选 A）

**方案 A（推荐）：不改首页，让诊断结果页的平台搜索自然承接。**
首页标签点击 → 跳到诊断页 → 诊断结果页已有平台搜索。
不需要额外改动。

**方案 B：首页底部增加"热门搜索"区块。**
如果选这个方案：预设 3 个热门搜索词，每个显示 2 条 Bilibili 结果。
但这会增加首页 API 调用量，当前阶段不建议。

### 建议
选方案 A，不额外改首页。

---

## 任务 S7：Supabase 搜索缓存表（可选，后续优化）

### 目标
把搜索结果持久化到 Supabase，减少 API 调用。

### 适用场景
当 Vercel serverless 冷启动频繁导致内存缓存失效时。

```sql
CREATE TABLE search_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  query TEXT NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(platform, query)
);

CREATE INDEX idx_search_cache_lookup ON search_cache(platform, query);
CREATE INDEX idx_search_cache_expires ON search_cache(expires_at);
```

### 缓存逻辑
- 写入时设 `expires_at = NOW() + INTERVAL '24 hours'`
- 读取时检查 `expires_at > NOW()`
- 可选：定期清理过期缓存 `DELETE FROM search_cache WHERE expires_at < NOW()`

### 建议
当前阶段先用内存缓存（任务 S2 已实现），等上线后如果发现缓存命中率低再切到 Supabase。

---

## 环境变量汇总

```env
# .env.local 新增
YOUTUBE_API_KEY=your_youtube_data_api_v3_key_here

# Bilibili 不需要 API key
# 如果后续被限流，可以加 cookie：
# BILIBILI_COOKIE=your_bilibili_cookie_here
```

### YouTube API Key 获取步骤

1. 打开 https://console.cloud.google.com/
2. 创建一个新项目（或用现有项目）
3. 在 API Library 中搜索 "YouTube Data API v3"，点击 Enable
4. 在 Credentials 页面创建一个 API Key
5. 把 key 填入 .env.local

免费额度：每天 10,000 units，每次 search 消耗 100 units = 每天 100 次搜索。

---

## 执行顺序

```
S1（规则加 searchQueries）
  ↓
S2（API Route）
  ↓
S3（前端组件）
  ↓
S4（诊断结果页集成）
  ↓
S5（内容库页集成）
  ↓
S6（首页：不改，方案 A）
  ↓
S7（Supabase 缓存：可选，后续再做）
```

每完成一个任务后运行：
- `npm run build`
- `npm run validate:data`（S1 完成后）
- `npm test`

---

## 你需要做的人工任务

1. **申请 YouTube API Key**：按上面的步骤获取，填入 `.env.local`
2. **Review searchQueries**：S1 中我给的搜索词是基于常见教学场景写的，你作为教练看看有没有更好的搜索词。特别是 Bilibili 的搜索词——你比我更清楚什么词能搜到好内容。
3. **测试 Bilibili 搜索的稳定性**：在浏览器直接访问几次 Bilibili 搜索 API，确认不会被封。如果被限流，考虑降低调用频率或加 cookie。
