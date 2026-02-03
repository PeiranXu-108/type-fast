# PK 竞技模式使用指南

## 功能概述

PK 竞技模式是一个实时双人对战功能，允许用户与其他玩家进行打字速度比拼。

## 技术架构

- **后端**: Node.js + Express + Socket.IO
- **前端**: React + Socket.IO Client + Zustand
- **实时通信**: WebSocket

## 环境配置

### 1. 环境变量设置

在项目根目录创建 `.env` 文件（如果还没有），添加以下配置：

```env
# Server Configuration
PORT=3001
CLIENT_URL=http://localhost:5173

# Socket.IO Configuration
VITE_SOCKET_URL=http://localhost:3001

# API Keys (可选，用于 AI 生成功能)
VITE_DOUBAO_API_KEY=your_api_key_here
DOUBAO_API_KEY=your_api_key_here
```

### 2. 安装依赖

已经通过 `npm install` 自动安装了以下依赖：
- `socket.io` (服务端)
- `socket.io-client` (客户端)

## 启动服务

### 开发环境

1. 启动后端服务器：
```bash
node server.js
```

2. 启动前端开发服务器：
```bash
npm run dev
```

3. 访问 `http://localhost:5173/battle` 进入 PK 模式

### 生产环境

1. 构建前端：
```bash
npm run build
```

2. 启动后端服务器：
```bash
NODE_ENV=production node server.js
```

## 使用流程

### 1. 匹配对手

1. 进入 PK 模式页面
2. 输入玩家昵称
3. 选择难度（简单/中等/困难）
4. 点击"开始匹配"

### 2. 准备游戏

1. 等待对手加入
2. 双方都点击"准备"按钮
3. 系统自动开始倒计时（3秒）

### 3. 开始打字

1. 倒计时结束后开始打字
2. 实时显示自己和对手的进度
3. 显示 WPM、CPM、准确率等数据
4. 完成文章后自动提交成绩

### 4. 查看结果

1. 显示双方的详细成绩
2. 判定胜负（优先比较 WPM，其次准确率，最后用时）
3. 可选择"再来一局"或"返回大厅"

## 功能特性

### 核心功能
- ✅ 实时匹配系统
- ✅ 双人实时对战
- ✅ 进度实时同步
- ✅ 自动断线重连
- ✅ 防作弊验证
- ✅ 多难度选择
- ✅ 详细结果对比

### 难度设置
- **简单**: 15-20 词的短文章
- **中等**: 30-40 词的中等文章
- **困难**: 50+ 词的长文章

### 胜负判定规则
1. 优先比较 WPM（每分钟词数）
2. WPM 相同时比较准确率
3. 准确率相同时比较完成时间
4. 完全相同则判定为平局

## 项目结构

```
type-fast/
├── socket/                      # 后端 Socket.IO 相关
│   ├── roomManager.js          # 房间管理
│   ├── gameEngine.js           # 游戏引擎
│   └── socketHandlers.js       # Socket 事件处理
├── src/
│   ├── hooks/
│   │   └── useBattleSocket.js  # Socket 连接 Hook
│   ├── store/
│   │   └── battleStore.js      # PK 状态管理
│   ├── components/
│   │   ├── BattleRoom.jsx      # 房间匹配组件
│   │   ├── BattleTypingArea.jsx # 打字区域组件
│   │   ├── OpponentProgress.jsx # 对手进度组件
│   │   └── BattleResults.jsx   # 结果展示组件
│   ├── pages/
│   │   └── BattlePage.jsx      # PK 主页面
│   └── static/
│       ├── zh/common.json      # 中文翻译
│       └── en/common.json      # 英文翻译
└── server.js                    # 增强的服务器（集成 Socket.IO）
```

## Socket.IO 事件

### 客户端 → 服务器
- `quick-match`: 快速匹配
- `join-room`: 加入房间
- `leave-room`: 离开房间
- `player-ready`: 玩家准备
- `typing-progress`: 发送打字进度
- `game-complete`: 游戏完成
- `get-waiting-count`: 获取等待人数

### 服务器 → 客户端
- `room-joined`: 成功加入房间
- `player-joined`: 其他玩家加入
- `player-left`: 玩家离开
- `player-ready-updated`: 准备状态更新
- `game-started`: 游戏开始
- `opponent-progress`: 对手进度更新
- `opponent-completed`: 对手完成
- `game-ended`: 游戏结束
- `error`: 错误消息

## 性能优化

- 进度更新节流（100ms）
- WebSocket 二进制传输
- 客户端状态缓存
- 自动清理过期房间（30分钟）

## 安全机制

- 服务器端进度验证
- 异常 WPM 检测（>200 WPM）
- 进度倒退检测
- 文章长度验证

## 故障排除

### 无法连接到服务器
1. 检查后端服务是否启动
2. 检查 `.env` 中的 `VITE_SOCKET_URL` 配置
3. 检查防火墙设置

### 匹配不到对手
1. 确保至少有两个用户在线
2. 检查难度设置是否一致
3. 查看浏览器控制台是否有错误

### 进度不同步
1. 检查网络连接
2. 查看浏览器控制台的 Socket 连接状态
3. 刷新页面重新连接

## 未来优化方向

- [ ] 添加排行榜系统
- [ ] 支持自定义房间（邀请好友）
- [ ] 添加观战模式
- [ ] 语音/文字聊天功能
- [ ] 成就系统
- [ ] 历史战绩记录
- [ ] 多人房间支持（3人以上）
- [ ] 淘汰赛模式

## 技术支持

如遇到问题，请：
1. 查看浏览器控制台错误信息
2. 查看服务器日志
3. 提交 Issue 到 GitHub

## 贡献指南

欢迎贡献代码！请遵循以下步骤：
1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

