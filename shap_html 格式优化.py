import os
import glob
import sys

# =========================================================================
# 【重要配置】
# 请根据您的实际文件路径修改下面的 base_dir 变量。
# 
# 脚本将搜索此目录下所有的 .html 文件并进行清理。
# 选项 1 (推荐): 如果您将此脚本放在 HTML 文件所在的目录中，请使用 "."
base_dir = "." 
# 选项 2: 如果您需要清理的 HTML 文件位于子目录中，请使用 glob 库。
# 示例：如果您需要清理 'visualizations' 目录下的所有文件，请将 base_dir 设置为父目录，
# 并修改 file_pattern 为 os.path.join(base_dir, "visualizations", "*.html")
# =========================================================================

# 1. 定义需要移除的非法控制字符集合 (ASCII 0x00 到 0x1F，但不包括 Tab, LF, CR)
# \t (9), \n (10), \r (13) 是合法的 HTML 空白字符，需要保留。
ILLEGAL_CHAR_CODES = bytes([i for i in range(32) if i not in [9, 10, 13]])
TRANSLATION_TABLE = None

def clean_html_file(filepath):
    """读取文件内容，移除非法控制字符，并写回文件。"""
    if not os.path.exists(filepath):
        print(f"❌ 错误: 找不到文件 {filepath}")
        return

    # 由于控制字符是二进制数据，我们使用二进制模式读写。
    try:
        # 读取文件内容 (rb)
        with open(filepath, 'rb') as f:
            content_bytes = f.read()

        # 移除非法字符
        cleaned_content = content_bytes.translate(TRANSLATION_TABLE, ILLEGAL_CHAR_CODES)
        
        # 检查是否发生了清理（通过比较长度，因为移除字符会减少字节数）
        if len(cleaned_content) == len(content_bytes):
            # print(f"✅ 文件 {filepath}: 未发现非法控制字符。")
            return

        # 写回文件 (wb)
        with open(filepath, 'wb') as f:
            f.write(cleaned_content)
            
        removed_count = len(content_bytes) - len(cleaned_content)
        print(f"✨ 成功清理文件 {filepath}: 已移除 {removed_count} 个非法控制字符。")

    except Exception as e:
        print(f"❌ 清理文件 {filepath} 时发生错误: {e}")
        # 如果出现编码错误，可能需要检查文件是否是真正的文本文件。
        
def run_cleaning_script():
    """主函数：执行清理操作"""
    
    # 使用 glob 查找所有 HTML 文件
    file_pattern = os.path.join(base_dir, "**", "*.html") # ** 允许搜索子目录
    target_files = glob.glob(file_pattern, recursive=True)

    print("======================================================")
    print("  🛠️ HTML 控制字符增强清理脚本 (V2) 正在运行...")
    print(f"  🔍 搜索路径: {os.path.abspath(base_dir)}")
    print("======================================================")
    
    if not target_files:
        print(f"⚠️ 在目录 '{os.path.abspath(base_dir)}' 及其子目录中未找到任何 HTML 文件。")
        print("请检查脚本顶部的 'base_dir' 路径设置是否正确。")
    else:
        for file in target_files:
            clean_html_file(file)

    print("======================================================")
    print("  ✅ 清理完成。请重新运行您的前端服务（Vite）。")
    print("======================================================")

if __name__ == "__main__":
    run_cleaning_script()
