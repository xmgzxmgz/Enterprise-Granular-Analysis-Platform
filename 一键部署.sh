#!/bin/bash
# 文件名: update_app.sh
# 功能: 一键更新前后端项目，并备份旧文件，然后重启服务。
# --------------------------------------------------------

# ====================================================================
# 1. 变量定义
# ====================================================================

# --------------------------------------------------------
# A. 路径定义
# --------------------------------------------------------
# 临时上传目录 (新文件存放的源目录)
UPLOAD_DIR="/home/ubuntu/XAI"

# 后端部署目录
BACKEND_DIR="/opt/app/backend"
# 前端部署目录 (Nginx 根目录)
FRONTEND_DIR="/var/www/myfrontend"

# --------------------------------------------------------
# B. 文件名定义
# --------------------------------------------------------
# 新上传的 Jar 包文件名 (请保持与您实际文件名一致)
NEW_JAR_NAME="egap-backend-0.1.0.jar"
# 后端服务名称
SERVICE_NAME="xai.service"

# --------------------------------------------------------
# C. 时间戳和备份后缀
# --------------------------------------------------------
# 生成当前日期和时间的字符串作为备份后缀 (格式: YYYYMMDD_HHMMSS_bak)
TIMESTAMP=$(date +"%Y%m%d_%H%M%S_bak")

# ====================================================================
# 2. 检查新文件是否存在
# ====================================================================
echo "--- 检查新上传文件是否存在 ---"
if [ ! -f "${UPLOAD_DIR}/${NEW_JAR_NAME}" ]; then
    echo "错误: 新的 Jar 包文件 ${UPLOAD_DIR}/${NEW_JAR_NAME} 不存在，请先上传。"
    exit 1
fi

if [ ! -d "${UPLOAD_DIR}/dist" ]; then
    echo "错误: 新的前端 dist 目录 ${UPLOAD_DIR}/dist 不存在，请先上传。"
    exit 1
fi

# ====================================================================
# 3. 备份旧文件和目录
# ====================================================================
echo "--- 正在备份旧的后端 Jar 包 ---"
# 检查当前 Jar 包是否存在并进行备份
if [ -f "${BACKEND_DIR}/${NEW_JAR_NAME}" ]; then
    OLD_JAR_PATH="${BACKEND_DIR}/${NEW_JAR_NAME}"
    BACKUP_JAR_NAME="${NEW_JAR_NAME}.${TIMESTAMP}"
    sudo mv "${OLD_JAR_PATH}" "${BACKUP_JAR_NAME}"
    echo "备份成功: ${NEW_JAR_NAME} -> ${BACKUP_JAR_NAME}"
else
    echo "警告: 部署目录中未发现旧的 Jar 包，跳过备份。"
fi

echo "--- 正在备份旧的前端文件 ---"
# 备份前端目录（将整个目录打包并命名）
BACKUP_FRONTEND_NAME="myfrontend.${TIMESTAMP}.tar.gz"
# 切换到 /var/www 目录进行打包，可以避免路径问题
cd /var/www
sudo tar -czf "${BACKUP_FRONTEND_NAME}" myfrontend
# 将打包好的备份文件移动到上传目录（方便管理）
sudo mv "${BACKUP_FRONTEND_NAME}" "${UPLOAD_DIR}/"
echo "备份成功: 旧前端文件已打包为 ${UPLOAD_DIR}/${BACKUP_FRONTEND_NAME}"
# 切换回工作目录
cd - > /dev/null 2>&1


# ====================================================================
# 4. 部署新文件
# ====================================================================

echo "--- 正在部署新的 Jar 包 ---"
# 移动新的 Jar 包到部署目录
sudo mv "${UPLOAD_DIR}/${NEW_JAR_NAME}" "${BACKEND_DIR}/"
echo "部署成功: ${NEW_JAR_NAME} 已移动到 ${BACKEND_DIR}/"

echo "--- 正在部署新的前端文件 ---"
# 清空旧的前端目录内容 (保持目录本身存在)
sudo rm -rf "${FRONTEND_DIR}/*"
# 移动新的 dist 目录内容到前端目录
sudo mv "${UPLOAD_DIR}/dist/"* "${FRONTEND_DIR}/"
# 移除空的 dist 目录 (可选)
sudo rm -rf "${UPLOAD_DIR}/dist"
echo "部署成功: 新前端文件已部署到 ${FRONTEND_DIR}/"


# ====================================================================
# 5. 重启服务
# ====================================================================

echo "--- 正在重启后端服务 (${SERVICE_NAME}) ---"
sudo systemctl restart "${SERVICE_NAME}"
echo "后端重启命令已发送。"

echo "--- 正在重启 Nginx Web 服务器 ---"
sudo systemctl restart nginx
echo "Nginx 重启命令已发送。"

# 稍作等待，检查服务状态
sleep 5
echo "--- 检查服务状态 ---"

# 检查后端服务状态
if sudo systemctl is-active --quiet "${SERVICE_NAME}"; then
    echo "✅ 后端服务 (${SERVICE_NAME}) 运行正常。"
else
    echo "❌ 警告: 后端服务 (${SERVICE_NAME}) 启动失败，请检查日志: sudo journalctl -u ${SERVICE_NAME} -e"
fi

# 检查 Nginx 状态
if sudo systemctl is-active --quiet nginx; then
    echo "✅ Nginx 服务运行正常。"
else
    echo "❌ 警告: Nginx 启动失败，请检查配置: sudo nginx -t"
fi

echo "--- 更新脚本执行完毕 ---"