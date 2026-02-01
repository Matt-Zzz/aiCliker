## 桌面应用程序 GUI 自动化代理框架设计

### 核心目标
搭建一套通用的跨平台（Windows/macOS）桌面 GUI 自动化代理，主要用于自动化桌面应用（例如 iClicker）中登录、选课、答题等流程，同时通过图形化配置界面让非开发者也能设置参数和策略。

### 参数化管理界面
- 基于 Python + `tkinter` 或 `PySimpleGUI` 搭建配置窗口。
- 模块：用户凭证（账号/密码）、课程/会话标识符、时间计划（cron-like + 滑块）、操作策略选择器（例如答题策略、重试次数）。
- 提供配置保存/载入功能，自动写入 JSON/YAML；
- 支持调试模式，展示当前配置及模拟事件。

### 应用程序自动化模块
- 核心：使用 `pyautogui`（或结合 `opencv-python` 进行图像识别）实现启动应用、窗口聚焦、导航按钮操作。
- 任务流：读取配置 → 启动/激活目标程序 → 自动填写凭证 → 加入课程/会话 → 进入答题界面。
- 支持屏幕状态检测（例如登录成功、课表显示）和异常恢复（重启应用、通知用户）。
- 可以封装为后台服务（daemon/thread），配合 `pywinauto` 或 `Quartz` 提供更稳定的控制。

### 智能响应引擎
- 多策略响应模块（规则、模板、简单推理）。
- 屏幕状态检测：周期截屏 + OCR（如 `pytesseract`）识别当前题目。
- 决策流程：根据策略匹配预设答案、搜索本地知识库、调用外部模型接口，再通过 GUI 点击提交。
- 响应提交管理：确认答案提交成功、记录时间与记录、处理确认弹窗/错误提示。

### 调度系统
- 基于时间触发机制（Python `schedule` / APScheduler）控制何时启动、加入会话、答题。
- 管理会话生命周期：启动前检查当前会话状态，结束后清理/截图归档。
- 状态监控：内置状态表、日志更新，UI 实时反馈当前阶段。
- 异常处理：识别卡死/弹窗后自动截图并发送通知（可选邮件/桌面通知）。

### 日志与报告
- 持续记录操作日志（事件、截图、策略、时间戳）。
- 提供可导出的报告（CSV/JSON），便于复盘。
- 支持日志轮转及按会话归档，方便排查。

### 技术约束
- Python 主导：利用 `pyautogui`, `opencv`, `pytesseract`, `schedule` 等稳定库。
- 跨平台兼容：封装平台差异（窗口管理、截图路径），必要时通过抽象层做适配。
- 包含图形配置界面，使用轻量 GUI 框架 + 状态栏显示实时日志。
- 支持后台服务模式，可注册为系统服务/守护进程，同时提供前台 GUI 监控面板。
- 所有关键操作封装为可重用的指令（执行命令队列），方便未来接入更复杂的 AI agent。

## 推荐仓库结构

- `src/gui_agent/`: Python library for automation, vision, scheduling, and logging with stubs ready for expansion.
- `ui/config_ui.py`: Simple Tkinter window to configure credentials, course/session selectors, and scheduling.
- `README.md`: this document, connecting the web/agent vision with the desktop automation blueprint.


步骤1：输入信息
步骤2：打开iClicker应用程序
步骤3：等待应用程序启动，然后通过图像识别找到登录按钮并点击
步骤4：在登录界面输入账号和密码
步骤5：进入后选择课程
步骤6：在指定的时间段内进入答题模式
步骤7：在答题模式下，不断截屏识别问题，并根据预设的答案逻辑选择答案
