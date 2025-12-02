// SQL Schema Display Script
document.addEventListener('DOMContentLoaded', function () {
    loadSqlContent();
});

/**
 * 加载SQL脚本内容
 */
function loadSqlContent() {
    const sqlContentDiv = document.getElementById('sqlContent');

    // 尝试多个可能的路径
    const possiblePaths = [
        '../finance_compliance_tables.sql',
        './finance_compliance_tables.sql',
        '/finance_compliance_tables.sql',
        'finance_compliance_tables.sql'
    ];

    let currentPathIndex = 0;

    function tryLoadPath(pathIndex) {
        if (pathIndex >= possiblePaths.length) {
            // 所有路径都失败，显示错误信息
            sqlContentDiv.innerHTML = `
                <div class="sql-error">
                    <strong>加载失败</strong><br>
                    无法加载SQL文件<br>
                    <br>
                    <strong>可能的原因：</strong><br>
                    1. 如果直接打开HTML文件（file://协议），需要使用本地服务器运行<br>
                    2. 请确保 finance_compliance_tables.sql 文件存在于 V2 目录下<br>
                    <br>
                    <strong>解决方法：</strong><br>
                    1. 在 V2 目录下启动本地服务器：<br>
                       <code>python -m http.server 8000</code> 或 <code>python3 -m http.server 8000</code><br>
                    2. 然后访问：<code>http://localhost:8000/pages/sql-schema.html</code><br>
                    <br>
                    <small>尝试的路径：${possiblePaths.join(', ')}</small>
                </div>
            `;
            return;
        }

        const path = possiblePaths[pathIndex];

        fetch(path)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(sqlText => {
                // 创建pre元素来显示SQL代码
                const preElement = document.createElement('pre');
                preElement.className = 'sql-content';
                preElement.textContent = sqlText;
                sqlContentDiv.innerHTML = '';
                sqlContentDiv.appendChild(preElement);
                console.log('SQL文件加载成功，路径:', path);
            })
            .catch(error => {
                console.warn(`路径 ${path} 加载失败:`, error);
                // 尝试下一个路径
                tryLoadPath(pathIndex + 1);
            });
    }

    // 开始尝试加载
    tryLoadPath(0);
}

/**
 * 复制SQL内容到剪贴板
 */
function copySqlToClipboard() {
    const sqlContent = document.querySelector('.sql-content');
    if (!sqlContent) {
        showMessage('未找到SQL内容', 'error');
        return;
    }

    const sqlText = sqlContent.textContent;

    // 使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(sqlText)
            .then(() => {
                showMessage('已复制到剪贴板', 'success');
            })
            .catch(err => {
                console.error('复制失败:', err);
                fallbackCopyToClipboard(sqlText);
            });
    } else {
        // 降级方案：使用传统方法
        fallbackCopyToClipboard(sqlText);
    }
}

/**
 * 降级复制方案
 */
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showMessage('已复制到剪贴板', 'success');
        } else {
            showMessage('复制失败，请手动复制', 'error');
        }
    } catch (err) {
        console.error('复制失败:', err);
        showMessage('复制失败，请手动复制', 'error');
    } finally {
        document.body.removeChild(textArea);
    }
}

/**
 * 显示提示消息
 */
function showMessage(message, type) {
    // 移除已存在的消息
    const existingMessage = document.querySelector('.copy-success');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'copy-success';
    messageDiv.textContent = message;

    if (type === 'error') {
        messageDiv.style.background = '#ff6b6b';
    }

    document.body.appendChild(messageDiv);

    // 2秒后自动移除
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 2000);
}

