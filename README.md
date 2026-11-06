# Mall Storefront

本项目是商城官网前端，基于 Vue 3、TypeScript、uni-app 和 Vite 构建，支持 PC 端与 H5 端。

## 功能

- 首页、商品分类、搜索和商品列表
- 商品详情、品牌专区和推荐商品
- 购物流程、购买指南和常见问题
- 中文、葡萄牙语等多语言展示
- 响应式布局，适配桌面端和移动端

## 环境要求

- Node.js 20 或更高版本
- npm 10 或更高版本

## 本地运行

```bash
npm install
npm run dev:h5
```

启动后访问终端提示的地址，通常为 `http://localhost:5174/`。

## 构建发布

```bash
npm run build:h5
```

构建产物位于 `dist/build/h5`。部署时将该目录内容上传到 Web 服务器的网站目录。

## 接口配置

生产环境接口地址在 `.env.production` 中配置：

```env
VITE_API_BASE_URL=/portal-api
```

线上由 Nginx 将 `/portal-api/` 转发到商城门户服务。开发环境可在 `.env.development` 中配置本地接口地址。

## 目录结构

```text
src/
├── apis/         API 请求方法
├── components/   通用组件
├── composables/  组合式函数
├── pages/        页面
├── static/       图片和其他静态资源
├── stores/       Pinia 状态管理
├── styles/       全局样式
├── types/        TypeScript 类型定义
└── utils/        工具函数
```

## 多语言数据

商品、品牌、分类等内容的多语言字段使用后端数据表中的 `translations` JSON 字段保存。前端根据当前语言读取对应翻译，未配置翻译时回退到默认内容。

## 许可证

本项目的使用和发布遵循仓库中的许可证文件。
