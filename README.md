# diqie6.github.io

个人小站导航首页，线上地址：<https://diqie6.github.io/>

每个成品单独一个仓库，各自发布在 `https://diqie6.github.io/<仓库名>/`。

## 现在有哪些站

| 站点 | 仓库 | 线上地址 |
|---|---|---|
| 碳名局 · Carbon Name Lab | [IUPAC](https://github.com/DIQIE6/IUPAC) | <https://diqie6.github.io/IUPAC/> |
| AlgoPick · 算法选型训练器 | [ALGOPICK](https://github.com/DIQIE6/ALGOPICK) | <https://diqie6.github.io/ALGOPICK/> |
| Mini Metro 复刻 | [MINIMETRO](https://github.com/DIQIE6/MINIMETRO) | <https://diqie6.github.io/MINIMETRO/> |

## 以后怎么加一个站点

1. 在 GitHub 新建仓库，把站点推上去（`main` 分支）。
2. 仓库 **Settings → Pages → Source** 选 `Deploy from a branch`，分支 `main`、目录 `/ (root)`，保存。
3. 打开本仓库的 `js/sites.js`，照着已有条目加一段：

```js
{
  name: '新站名字',
  subtitle: 'English Name',
  desc: '一句话介绍。',
  url: 'https://diqie6.github.io/新仓库名/',
  tag: '分类',
},
```

4. 提交并推送 `main`，首页会自动更新（GitHub Pages 重新构建约 1 分钟）。

> 只想要一个文件的话：`index.html` 负责渲染，`js/sites.js` 负责数据，`styles.css` 负责样式。三者互不干扰，改配色改 `styles.css` 顶部的 `:root` 变量即可。

## 本地预览

```powershell
python -m http.server 8080
```

然后打开 <http://127.0.0.1:8080/>。

## 文件

| 文件 | 作用 |
|---|---|
| `index.html` | 门户页面结构 + 渲染卡片的小脚本 |
| `js/sites.js` | **站点清单（常改的就是这个）** |
| `styles.css` | 全部样式 |
| `assets/favicon.svg` | 站点图标 |
| `.nojekyll` | 告诉 GitHub Pages 不要跑 Jekyll |
