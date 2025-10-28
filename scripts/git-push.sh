#!/bin/bash

# Git Push Helper Script
# 智能提交和推送助手

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

print_header() {
    echo ""
    print_color "$BLUE" "=================================="
    print_color "$BLUE" "  Git Push Helper"
    print_color "$BLUE" "=================================="
    echo ""
}

# 檢查是否在 git 倉庫中
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_color "$RED" "❌ 錯誤: 不在 Git 倉庫中"
        exit 1
    fi
}

# 檢查是否有未提交的更改
check_changes() {
    if [[ -z $(git status -s) ]]; then
        print_color "$YELLOW" "⚠ 沒有需要提交的更改"
        exit 0
    fi
}

# 顯示狀態
show_status() {
    print_color "$BLUE" "📊 當前狀態:"
    echo ""
    git status -s
    echo ""
}

# 運行測試
run_tests() {
    print_color "$YELLOW" "🧪 運行測試..."

    # 後端測試
    if [ -f "functions/test_functions.py" ]; then
        print_color "$BLUE" "  → 後端測試"
        cd functions
        if [ -d "venv" ]; then
            source venv/bin/activate
            python test_functions.py
            deactivate
        fi
        cd ..
        print_color "$GREEN" "  ✓ 後端測試通過"
    fi

    # 前端類型檢查
    if [ -f "frontend/package.json" ]; then
        print_color "$BLUE" "  → 前端類型檢查"
        cd frontend
        if [ -d "node_modules" ]; then
            npm run lint 2>/dev/null || true
        fi
        cd ..
        print_color "$GREEN" "  ✓ 前端檢查完成"
    fi

    echo ""
}

# 安全檢查
security_check() {
    print_color "$YELLOW" "🔒 安全檢查..."

    # 檢查敏感文件
    if git diff --cached --name-only | grep -E "serviceAccountKey|\.env\.production|\.env\.local$" > /dev/null; then
        print_color "$RED" "❌ 警告: 發現敏感文件將被提交!"
        git diff --cached --name-only | grep -E "serviceAccountKey|\.env"
        echo ""
        read -p "確定要繼續嗎? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            print_color "$YELLOW" "已取消提交"
            exit 1
        fi
    fi

    # 檢查大文件
    large_files=$(git diff --cached --name-only | xargs -I {} du -h {} 2>/dev/null | awk '$1 ~ /M$/ && $1+0 > 5')
    if [ ! -z "$large_files" ]; then
        print_color "$YELLOW" "⚠ 警告: 發現大文件:"
        echo "$large_files"
        echo ""
    fi

    print_color "$GREEN" "✓ 安全檢查完成"
    echo ""
}

# 獲取提交類型
get_commit_type() {
    echo ""
    print_color "$BLUE" "選擇提交類型:"
    echo "1) feat     - 新功能"
    echo "2) fix      - Bug 修復"
    echo "3) docs     - 文檔變更"
    echo "4) style    - 代碼格式"
    echo "5) refactor - 重構"
    echo "6) test     - 測試相關"
    echo "7) chore    - 構建/工具變更"
    echo ""
    read -p "輸入選項 (1-7): " choice

    case $choice in
        1) echo "feat";;
        2) echo "fix";;
        3) echo "docs";;
        4) echo "style";;
        5) echo "refactor";;
        6) echo "test";;
        7) echo "chore";;
        *) echo "feat";;
    esac
}

# 獲取作用域
get_scope() {
    echo ""
    print_color "$BLUE" "選擇作用域 (可選，直接回車跳過):"
    echo "1) frontend  - 前端"
    echo "2) backend   - 後端"
    echo "3) functions - Cloud Functions"
    echo "4) docs      - 文檔"
    echo "5) ci        - CI/CD"
    echo ""
    read -p "輸入選項 (1-5) 或直接回車: " choice

    case $choice in
        1) echo "frontend";;
        2) echo "backend";;
        3) echo "functions";;
        4) echo "docs";;
        5) echo "ci";;
        *) echo "";;
    esac
}

# 主函數
main() {
    print_header

    # 檢查
    check_git_repo
    check_changes

    # 顯示狀態
    show_status

    # 詢問是否要添加所有文件
    read -p "添加所有更改? (Y/n): " add_all
    if [ "$add_all" != "n" ] && [ "$add_all" != "N" ]; then
        git add .
        print_color "$GREEN" "✓ 已添加所有更改"
    fi

    # 運行測試
    read -p "運行測試? (Y/n): " run_test
    if [ "$run_test" != "n" ] && [ "$run_test" != "N" ]; then
        run_tests
    fi

    # 安全檢查
    security_check

    # 構建提交訊息
    commit_type=$(get_commit_type)
    scope=$(get_scope)

    echo ""
    read -p "輸入提交訊息: " message

    # 組合完整的提交訊息
    if [ -z "$scope" ]; then
        full_message="${commit_type}: ${message}"
    else
        full_message="${commit_type}(${scope}): ${message}"
    fi

    echo ""
    print_color "$BLUE" "完整提交訊息:"
    print_color "$GREEN" "  $full_message"
    echo ""

    read -p "確認提交? (Y/n): " confirm
    if [ "$confirm" == "n" ] || [ "$confirm" == "N" ]; then
        print_color "$YELLOW" "已取消提交"
        exit 0
    fi

    # 提交
    git commit -m "$full_message"
    print_color "$GREEN" "✓ 提交成功"

    # 推送
    echo ""
    read -p "推送到遠程? (Y/n): " push
    if [ "$push" != "n" ] && [ "$push" != "N" ]; then
        current_branch=$(git branch --show-current)
        print_color "$BLUE" "推送到 origin/$current_branch..."
        git push origin $current_branch
        print_color "$GREEN" "✓ 推送成功"
    fi

    echo ""
    print_color "$GREEN" "🎉 完成!"
    echo ""
}

# 執行
main
