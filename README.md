# VPS Remaining Value（纯 GitHub Pages 版）

用于计算 VPS 与各类订阅服务剩余价值的浏览器工具，支持汇率转换、分享链接以及 SVG 预览和下载。

在线使用：<https://dev.unlil.com/vps-remaining-value/>

![主界面](./resource/3.png)

## 特点

- 纯 HTML、CSS 和 JavaScript，无服务器、数据库或 API Key
- SVG 完全在浏览器中生成，数据不会提交到服务端
- 分享参数压缩到 `?v=...` 链接，可直接在 GitHub Pages 打开
- GitHub Actions 每 6 小时获取一次汇率并重新部署
- 汇率服务不可用时自动使用仓库内置备用数据

## 本地运行

```bash
python3 -m http.server 45867 --directory public
```

然后打开 <http://localhost:45867>。

## 部署

`.github/workflows/pages.yml` 会在 `master` 分支更新时自动发布 `public/`
目录，也会定时刷新汇率。仓库的 Pages 来源应设置为 **GitHub Actions**。

## 项目来源

本仓库基于 [YoungYannick/vps-remaining-value](https://github.com/YoungYannick/vps-remaining-value)
改造为纯 GitHub Pages 版本，并保留原项目署名。
