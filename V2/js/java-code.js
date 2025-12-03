// Java Code Preview Script
document.addEventListener('DOMContentLoaded', function () {
    loadJavaFileList();
});

// Java文件列表（硬编码，因为无法直接读取目录）
const javaFiles = [
    { name: 'AbstractSkuDetailMatcher.java', path: '../java/AbstractSkuDetailMatcher.java' },
    { name: 'CustomsDeclarationMatcher.java', path: '../java/CustomsDeclarationMatcher.java' },
    { name: 'ReturnOrderMatcher.java', path: '../java/ReturnOrderMatcher.java' },
    { name: 'SkuDetailMatchService.java', path: '../java/SkuDetailMatchService.java' },
    { name: 'MatchRequest.java', path: '../java/MatchRequest.java' },
    { name: 'MatchResult.java', path: '../java/MatchResult.java' },
    { name: 'MatchType.java', path: '../java/MatchType.java' },
    { name: 'MatchStatus.java', path: '../java/MatchStatus.java' },
    { name: 'CustomsDeclarationRequest.java', path: '../java/CustomsDeclarationRequest.java' },
    { name: 'CustomsDeclarationMatchResponse.java', path: '../java/CustomsDeclarationMatchResponse.java' },
    { name: 'ReturnOrderRequest.java', path: '../java/ReturnOrderRequest.java' },
    { name: 'ReturnOrderMatchResponse.java', path: '../java/ReturnOrderMatchResponse.java' }
];

let currentFile = null;

/**
 * 加载Java文件列表
 */
function loadJavaFileList() {
    const fileListDiv = document.getElementById('fileList');

    if (javaFiles.length === 0) {
        fileListDiv.innerHTML = '<div class="java-error">未找到Java文件</div>';
        return;
    }

    // 创建文件列表
    let html = '';
    javaFiles.forEach((file, index) => {
        html += `
            <div class="file-item" onclick="loadJavaFile('${file.path}', '${file.name}', this)" data-file="${file.name}">
                <span class="file-name">${file.name}</span>
                <span class="file-size">-</span>
            </div>
        `;
    });

    fileListDiv.innerHTML = html;
}

/**
 * 加载Java文件内容
 */
function loadJavaFile(filePath, fileName, element) {
    const javaContentDiv = document.getElementById('javaContent');
    const javaTitle = document.getElementById('javaTitle');
    const copyBtn = document.getElementById('copyBtn');

    // 更新标题
    javaTitle.textContent = fileName;
    copyBtn.style.display = 'block';

    // 显示加载状态
    javaContentDiv.innerHTML = '<div class="java-loading">正在加载文件...</div>';

    // 移除其他文件的active状态
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('active');
    });

    // 添加当前文件的active状态
    if (element) {
        element.classList.add('active');
    }

    // 尝试多个可能的路径
    const possiblePaths = [
        filePath,
        filePath.replace('../java/', './java/'),
        filePath.replace('../java/', '/java/'),
        filePath.replace('../java/', 'java/'),
        `../java/${fileName}`,
        `./java/${fileName}`,
        `/java/${fileName}`,
        `java/${fileName}`
    ];

    let currentPathIndex = 0;

    function tryLoadPath(pathIndex) {
        if (pathIndex >= possiblePaths.length) {
            // 所有路径都失败，显示错误信息
            javaContentDiv.innerHTML = `
                <div class="java-error">
                    <strong>加载失败</strong><br>
                    无法加载Java文件: ${fileName}<br>
                    <br>
                    <strong>可能的原因：</strong><br>
                    1. 如果直接打开HTML文件（file://协议），需要使用本地服务器运行<br>
                    2. 请确保Java文件存在于 V2/java 目录下<br>
                    <br>
                    <strong>解决方法：</strong><br>
                    1. 在 V2 目录下启动本地服务器：<br>
                       <code>python -m http.server 8000</code> 或 <code>python3 -m http.server 8000</code><br>
                    2. 然后访问：<code>http://localhost:8000/pages/java-code.html</code><br>
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
            .then(javaText => {
                // 创建pre元素来显示Java代码
                const preElement = document.createElement('pre');
                preElement.className = 'java-content';
                preElement.textContent = javaText;
                javaContentDiv.innerHTML = '';
                javaContentDiv.appendChild(preElement);
                currentFile = { path: path, name: fileName, content: javaText };
                console.log('Java文件加载成功，路径:', path);
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
 * 复制Java代码到剪贴板
 */
function copyJavaToClipboard() {
    const javaContent = document.querySelector('.java-content');
    if (!javaContent) {
        showMessage('未找到Java代码', 'error');
        return;
    }

    const javaText = javaContent.textContent;

    // 使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(javaText)
            .then(() => {
                showMessage('已复制到剪贴板', 'success');
            })
            .catch(err => {
                console.error('复制失败:', err);
                fallbackCopyToClipboard(javaText);
            });
    } else {
        // 降级方案：使用传统方法
        fallbackCopyToClipboard(javaText);
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

