# write-and-grow · 公开写作，边写边成长

> 自媒体文章开源归档仓库。把平时写的文章、随笔、思考沉淀下来，公开保存、可追溯、可检索。

## 📖 简介

这是一个**公开（public）**的 GitHub 仓库，用于统一保存个人自媒体文章（公众号、博客等）。
所有内容采用 **CC BY-NC-SA 4.0** 许可（见 `LICENSE`）。

- ✍️ 禁止未授权商用，转载请**署名**并**以相同方式共享**
- 🔍 全部 Markdown 纯文本，便于检索、备份、二次加工
- 🌱 鼓励持续写作 —— "write and grow"

## 🗂️ 目录结构

```
write-and-grow/
├── README.md          # 本说明
├── LICENSE            # CC BY-NC-SA 4.0 许可全文
├── .gitignore
├── articles/          # 已发布文章（按年份归档）
│   ├── _template.md   # 新文章模板
│   └── 2026/
├── drafts/            # 草稿 / 未发布
└── assets/            # 配图等静态资源
```

## ✍️ 添加一篇新文章

1. 复制 `articles/_template.md` 到 `articles/2026/你的标题.md`
2. 填写 frontmatter（标题、日期、标签、摘要、原文链接）
3. 粘贴正文（Markdown）
4. 配图放入 `assets/`，文中用相对路径引用
5. 提交：

```bash
git add .
git commit -m "add: 文章标题"
git push
```

## 🔄 内容工作流

本仓库适配「卡片笔记 → AI 优化 → 公众号发布 → 归档」的闭环：

1. **第二大脑**产出原始卡片笔记（Obsidian）
2. 经 AI 补充准确公开信息、去除过度私人化措辞、适配公开结构
3. 发布至微信公众号 / 技术博客
4. **归档至此仓库**，长期保存与检索

## 📌 许可证

[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

> 你可以自由阅读、转载、演绎，但**不得用于商业目的**，且演绎作品须采用相同许可，并注明原作者。
