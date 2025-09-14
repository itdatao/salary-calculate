# 五险一金计算器 - 部署指南

## 项目概述
这是一个功能完整的五险一金计算网站，基于React、TypeScript和Tailwind CSS开发，支持薪资计算、五险一金和个人所得税详细分析。

## 部署步骤

### 1. 准备工作
在部署前，请确保您的环境中安装了Node.js (v16.3.0+) 和pnpm。

### 2. 构建项目
首先，克隆或下载项目代码到本地，然后执行以下命令：

```bash
# 安装依赖
pnpm install

# 构建生产版本
pnpm run build
```

构建完成后，项目会生成一个`dist`文件夹，包含所有静态资源文件。

### 3. 部署选项

#### 选项1: Vercel (推荐)
1. 访问 [Vercel](https://vercel.com/) 并注册账号
2. 点击 "New Project"，导入您的项目代码仓库
3. Vercel会自动检测到这是一个Vite项目，您只需点击 "Deploy" 即可完成部署

#### 选项2: Netlify
1. 访问 [Netlify](https://www.netlify.com/) 并注册账号
2. 点击 "New site from Git"，导入您的项目代码仓库
3. 在构建设置中设置：
   - 构建命令: `pnpm run build`
   - 发布目录: `dist`
4. 点击 "Deploy site" 完成部署

#### 选项3: GitHub Pages
1. 确保您的项目已推送到GitHub仓库
2. 安装gh-pages依赖:
   ```bash
   pnpm install gh-pages --save-dev
   ```
3. 在package.json中添加部署脚本:
   ```json
   "scripts": {
     "deploy": "gh-pages -d dist"
   }
   ```
4. 执行部署命令:
   ```bash
   pnpm run build
   pnpm run deploy
   ```

### 4. 自定义域名 (可选)
大多数托管服务都支持自定义域名，您可以在相应平台的设置中找到域名配置选项，按照平台指引完成域名解析和绑定。

## 注意事项
- 部署前请确保所有代码已提交并测试通过
- 不同托管服务可能有不同的免费额度和功能限制，请根据您的需求选择合适的平台
- 部署后如果需要更新网站，只需推送新的代码更改，大多数平台会自动触发重新构建和部署

## 故障排除
- 如果构建失败，请检查Node.js版本是否符合要求
- 如果部署后页面样式异常，可能是静态资源路径问题，可以在vite.config.ts中调整base配置
- 如遇其他问题，请参考对应托管服务的官方文档或寻求技术支持

## 本地开发
如果需要进行二次开发，可以使用以下命令启动本地开发服务器:
```bash
pnpm run dev
```

访问 http://localhost:3000 即可查看网站。