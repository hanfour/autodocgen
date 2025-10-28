#!/bin/bash

# AutoDocGen 每日健康检查脚本
# 用于快速检查生产环境的健康状态

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔍 AutoDocGen 每日健康检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查是否安装了 firebase CLI
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI 未安装${NC}"
    echo "请运行: npm install -g firebase-tools"
    exit 1
fi

# 获取当前项目
PROJECT=$(firebase use 2>&1 | grep -v "Active Project")
echo -e "${BLUE}📌 当前项目:${NC} $PROJECT"
echo ""

# 1. 检查 Functions 状态
echo -e "${BLUE}━━━ 1. Cloud Functions 状态 ━━━${NC}"
echo ""

FUNCTIONS=$(firebase functions:list 2>&1)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Functions 列表:${NC}"
    echo "$FUNCTIONS" | tail -n +2

    # 统计 Function 数量
    FUNCTION_COUNT=$(echo "$FUNCTIONS" | tail -n +2 | wc -l)
    echo ""
    echo -e "${GREEN}✓ 总计: ${FUNCTION_COUNT} 个 Functions${NC}"
else
    echo -e "${RED}❌ 无法获取 Functions 列表${NC}"
fi

echo ""

# 2. 检查最近的错误
echo -e "${BLUE}━━━ 2. 最近的错误日志 (最近 24 小时) ━━━${NC}"
echo ""

ERRORS=$(firebase functions:log --limit 100 2>&1 | grep -i "error" | tail -10)
if [ -z "$ERRORS" ]; then
    echo -e "${GREEN}✓ 没有发现错误日志${NC}"
else
    echo -e "${YELLOW}⚠️  发现以下错误:${NC}"
    echo "$ERRORS"
fi

echo ""

# 3. 检查 Hosting 状态
echo -e "${BLUE}━━━ 3. Hosting 部署状态 ━━━${NC}"
echo ""

RELEASES=$(firebase hosting:releases:list --limit 3 2>&1)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 最近的部署:${NC}"
    echo "$RELEASES"
else
    echo -e "${RED}❌ 无法获取 Hosting 状态${NC}"
fi

echo ""

# 4. 提供快速链接
echo -e "${BLUE}━━━ 4. 快速访问链接 ━━━${NC}"
echo ""
echo "🌐 前端应用:"
echo "   https://autodocgen-prod.web.app"
echo ""
echo "🎛  Firebase Console:"
echo "   https://console.firebase.google.com/project/autodocgen-prod/overview"
echo ""
echo "📊 Functions 监控:"
echo "   https://console.firebase.google.com/project/autodocgen-prod/functions"
echo ""
echo "💾 Firestore 数据:"
echo "   https://console.firebase.google.com/project/autodocgen-prod/firestore"
echo ""
echo "📦 Storage:"
echo "   https://console.firebase.google.com/project/autodocgen-prod/storage"
echo ""
echo "💰 使用情况:"
echo "   https://console.firebase.google.com/project/autodocgen-prod/usage"
echo ""

# 5. 健康检查总结
echo -e "${BLUE}━━━ 5. 健康检查总结 ━━━${NC}"
echo ""

HEALTH_SCORE=100

if echo "$FUNCTIONS" | grep -q "error"; then
    HEALTH_SCORE=$((HEALTH_SCORE - 30))
    echo -e "${YELLOW}⚠️  Functions 有问题 (-30分)${NC}"
fi

if [ ! -z "$ERRORS" ]; then
    ERROR_COUNT=$(echo "$ERRORS" | wc -l)
    if [ $ERROR_COUNT -gt 5 ]; then
        HEALTH_SCORE=$((HEALTH_SCORE - 20))
        echo -e "${YELLOW}⚠️  发现多个错误日志 (-20分)${NC}"
    fi
fi

if [ $HEALTH_SCORE -eq 100 ]; then
    echo -e "${GREEN}✅ 系统健康状态: 优秀 (${HEALTH_SCORE}/100)${NC}"
elif [ $HEALTH_SCORE -ge 80 ]; then
    echo -e "${YELLOW}⚠️  系统健康状态: 良好 (${HEALTH_SCORE}/100)${NC}"
elif [ $HEALTH_SCORE -ge 60 ]; then
    echo -e "${YELLOW}⚠️  系统健康状态: 一般 (${HEALTH_SCORE}/100)${NC}"
    echo -e "${YELLOW}   建议: 检查错误日志并修复问题${NC}"
else
    echo -e "${RED}❌ 系统健康状态: 需要关注 (${HEALTH_SCORE}/100)${NC}"
    echo -e "${RED}   警告: 请立即检查系统状态！${NC}"
fi

echo ""

# 6. 建议的下一步操作
echo -e "${BLUE}━━━ 6. 建议的操作 ━━━${NC}"
echo ""

if [ ! -z "$ERRORS" ]; then
    echo "🔧 修复建议:"
    echo "   1. 查看详细日志: firebase functions:log --limit 50"
    echo "   2. 检查特定 Function: firebase functions:log --only [function-name]"
    echo "   3. 在 Console 查看详细错误信息"
    echo ""
fi

echo "📊 定期任务:"
echo "   • 每日: 运行此健康检查脚本"
echo "   • 每周: 审查使用量和费用"
echo "   • 每月: 备份重要数据"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ 健康检查完成！${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 如果有严重问题，返回非零退出码
if [ $HEALTH_SCORE -lt 60 ]; then
    exit 1
fi

exit 0
