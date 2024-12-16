// 引入 aiService 模块
import { analyzeText } from './aiService.js';

// 保存初始内容的变量
let initialHeroContent = '';

// 在文档加载时保存初始内容
document.addEventListener('DOMContentLoaded', function() {
    initialHeroContent = document.getElementById('resultContainer').innerHTML;
});

// 修改显示结果的函数
function displayResult(resultContainer, aiProbability, humanProbability, humanSegmentRatio) {
    const aiValue = parseFloat(aiProbability);
    const humanValue = parseFloat(humanProbability);
    
    // 构建基础HTML
    let resultHTML = `
        <div class="analysis-result">
            <h2 style="text-align: center;">分析结果</h2>
            <div class="result-container" style="border: 1px solid #ccc; border-radius: 8px; padding: 16px; background-color: #f9f9f9;">
                <div class="pie-chart-container" style="text-align: center;">
                    <canvas id="resultPieChart" width="200" height="200"></canvas>
                </div>
                <div class="result-stats" style="text-align: center;">
                    <div class="stat-item">
                        <span>AI概率:</span> 
                        <strong class="ai-probability">${aiProbability}%</strong>
                    </div>
                    <div class="stat-item">
                        <span>人类概率:</span> 
                        <strong class="human-probability">${humanProbability}%</strong>
                    </div>
                </div>
                ${ (aiValue > 60 && aiValue < 90) || (aiValue > 50 && parseFloat(humanSegmentRatio) > 0) ? `  
                    <div class="note-item" style="color: #555; text-align: left; font-size: 14px; margin-top: 10px;">
                        注意：AI在当前内容创作中提供了帮助，但仍有一部分可能由人类创作。
                    </div>` : ''}
            </div>
        </div>`;
    
    resultContainer.innerHTML = resultHTML;

    const canvas = document.getElementById('resultPieChart');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.6; // 饼图大小为画布的50%

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制AI部分（黑色）
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, 0, (Math.PI * 2 * aiValue) / 100);
    ctx.fillStyle = '#000000';
    ctx.fill();

    // 绘制Human部分（白色带边）
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, (Math.PI * 2 * aiValue) / 100, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 添加标注文本
    ctx.font = '12px Arial';
    
    // AI标注 - 左下方
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = '#000000';
    ctx.fillText(`AI: ${aiValue}%`, centerX - radius, centerY + radius + 20);

    // Human标注 - 右上方
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`Human: ${humanValue}%`, centerX + radius, centerY - radius - 20);
}

// 修改显示错误的函数
function displayError(resultContainer, errorMessage) {
    resultContainer.innerHTML = `
        <h2>错误</h2>
        <div class="error-message">
            ${errorMessage}
        </div>
    `;
}

// 封装处理结果计算的通用函数
async function processSegments(segments, resultContainer) {
    let finalResult = { aiProbability1: 0, humanProbability1: 0, aiProbability2: 0, humanProbability2: 0, aiProbability3: 0, humanProbability3: 0 };
    let validCount = 0; // 记录有效段落的数量
    let humanSegmentCount = 0; // 新增：计数器，统计AI概率都小于50%的段落数

    for (const segment of segments) {
        try {
            const { result01, result02, result03 } = await analyzeText(segment); // 调用封装的函数
            const aiProbability1 = result01.aiProbability; // 第一个模型的 AI 概率
            const humanProbability1 = result01.humanProbability; // 第一个模型的人类概率
            const aiProbability2 = result02.aiProbability; // 第二个模型的 AI 概率
            const humanProbability2 = result02.humanProbability; // 第二个模型的人类概率
            const aiProbability3 = result03.aiProbability; // 第三个模型的 AI 概率
            const humanProbability3 = result03.humanProbability; // 第三个模型的人类概率

            if (!isNaN(aiProbability1) && !isNaN(humanProbability1)) {
                finalResult.aiProbability1 += aiProbability1; // 累加第一个模型的结果
                finalResult.humanProbability1 += humanProbability1; // 累加第一个模型的人类概率
                validCount++; // 有效段落计数
            } else {
                console.warn(`Invalid: Model 1 - AI: ${aiProbability1}, Human: ${humanProbability1}`);
            }

            if (!isNaN(aiProbability2) && !isNaN(humanProbability2)) {
                finalResult.aiProbability2 += aiProbability2; // 累加第二个模型的结果
                finalResult.humanProbability2 += humanProbability2; // 累加第二个模型的人类概率
            } else {
                console.warn(`Invalid: Model 2 - AI: ${aiProbability2}, Human: ${humanProbability2}`);
            }

            if (!isNaN(aiProbability3) && !isNaN(humanProbability3)) {
                finalResult.aiProbability3 += aiProbability3; // 累加第三个模型的结果
                finalResult.humanProbability3 += humanProbability3; // 累加第三个模型的人类概率
            } else {
                console.warn(`Invalid: Model 3 - AI: ${aiProbability3}, Human: ${humanProbability3}`);
            }

            // 新增：检查该段落是否所有模型的AI概率都小于50%
            if (!isNaN(aiProbability1) && !isNaN(aiProbability2) && !isNaN(aiProbability3)) {
                if (aiProbability1 < 50 && aiProbability2 < 50 && aiProbability3 < 50) {
                    humanSegmentCount++;
                }
            }
        } catch (error) {
            if (error.response && error.response.status === 500) {
                console.warn('Ignored segment due to API error: Request failed with status code 500'); // 忽略500错误
            } else {
                console.error('Error calling the AI model:', error); // 处理其他错误
            }
        }
    }

    // 计算平均概率
    if (validCount > 0) { 
        finalResult.aiProbability1 = (finalResult.aiProbability1 / validCount).toFixed(2);
        finalResult.humanProbability1 = (finalResult.humanProbability1 / validCount).toFixed(2);
        finalResult.aiProbability2 = (finalResult.aiProbability2 / validCount).toFixed(2);
        finalResult.humanProbability2 = (finalResult.humanProbability2 / validCount).toFixed(2);
        finalResult.aiProbability3 = (finalResult.aiProbability3 / validCount).toFixed(2);
        finalResult.humanProbability3 = (finalResult.humanProbability3 / validCount).toFixed(2);

        // 计算三组概率的平均值
        const avgAiProbability = (
            (parseFloat(finalResult.aiProbability1) + 
             parseFloat(finalResult.aiProbability2) + 
             parseFloat(finalResult.aiProbability3)) / 3
        ).toFixed(2);

        const avgHumanProbability = (
            (parseFloat(finalResult.humanProbability1) + 
             parseFloat(finalResult.humanProbability2) + 
             parseFloat(finalResult.humanProbability3)) / 3
        ).toFixed(2);

        // 计算人类段落的比例
        const humanSegmentRatio = ((humanSegmentCount / validCount) * 100).toFixed(2);

        displayResult(resultContainer, avgAiProbability, avgHumanProbability, humanSegmentRatio);
    } else {
        throw new Error('No valid segments to process.');
    }
}

// 修改scanButton点击事件处理
document.getElementById('scanButton').addEventListener('click', async function() {
    const resultContainer = document.getElementById('resultContainer');
    const inputText = document.getElementById('inputText').value;
    
    // 隐藏按钮
    document.getElementById('scanButton').style.display = 'none';
    document.getElementById('uploadButton').style.display = 'none';
    
    if (!inputText.trim()) {
        displayError(resultContainer, 'Paste your text please');
        // 如果出错，重新显示按钮
        document.getElementById('scanButton').style.display = 'block';
        document.getElementById('uploadButton').style.display = 'block';
        return;
    }
    
    // 显示加载信息
    resultContainer.innerHTML = `
        <h2>处理中...</h2>
        <div id="loadingMessage">
            开始检测，长文本可能需要更长时间，但为了提升准确性，值得等待。
            <br/><br/>
            <span id="timer">0.0</span>s
        </div>
    `;

    // 启动计时器
    let seconds = 0;
    const timerInterval = setInterval(() => {
        seconds += 0.1;
        document.getElementById('timer').innerText = seconds.toFixed(1);
    }, 100);

    try {
        const segments = splitText(inputText);
        await processSegments(segments, resultContainer);
    } catch (error) {
        console.error('Error:', error);
        displayError(resultContainer, error.message);
    } finally {
        clearInterval(timerInterval);
        // 重新显示按钮
        document.getElementById('scanButton').style.display = 'block';
        document.getElementById('uploadButton').style.display = 'block';
    }
});

// 添加分段处理函数
function splitText(text, maxLength = 512) {
    const segments = [];
    let currentSegment = '';
    const encoder = new TextEncoder(); // 创建 TextEncoder 实例

    for (const char of text) {
        const charLength = encoder.encode(char).length; // 获取字符的字节长度
        if (encoder.encode(currentSegment).length + charLength > maxLength) {
            segments.push(currentSegment);
            currentSegment = char; // 开始新的段落
        } else {
            currentSegment += char; // 添加字符到当前段落
        }
    }

    if (currentSegment.length > 0) {
        segments.push(currentSegment); // 添加最后一个段落
    }

    return segments;
}

// 修改uploadButton点击事件处理
document.getElementById('uploadButton').addEventListener('click', function() {
    const resultContainer = document.getElementById('resultContainer');
    document.getElementById('inputText').value = '';
    
    // Handle file upload
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = function(event) {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        // 检查文件类型
        const supportedTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (!supportedTypes.includes(file.type)) {
            alert('请上传支持的文件类型：*.docx, *.txt');
            return;
        }

        // 隐藏按钮
        document.getElementById('scanButton').style.display = 'none';
        document.getElementById('uploadButton').style.display = 'none';

        // 清理已有内容并显示加载信息
        resultContainer.innerHTML = `
            <h2>处理中...</h2>
            <div id="loadingMessage">
                开始检测，大文件可能需要更长时间，但为了提升准确性，值得等待。
                <br/><br/>
                <span id="timer">0.0</span>s
            </div>
        `;

        // 启动计时器
        let seconds = 0;
        const timerInterval = setInterval(() => {
            seconds += 0.1; // 每次增加0.1秒
            document.getElementById('timer').innerText = seconds.toFixed(1); // 保留1位小数
        }, 100);

        // 读取文件内容为 ArrayBuffer
        const reader = new FileReader();
        reader.onload = function(event) {
            const arrayBuffer = event.target.result; // 获取 ArrayBuffer

            if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                // 处理 .docx 文件
                mammoth.extractRawText({arrayBuffer: arrayBuffer})
                    .then(async function(result) {
                        let fileContent = result.value; // 获取解析后的文本内容
                       // console.log('File content extracted:', fileContent); // 打印提取的文件内容
                        // 调用封装的函数并处理结果
                        try {
                            const segments = splitText(fileContent); // 调用分段处理函数
                            await processSegments(segments, resultContainer); // 处理分段结果
                        } catch (error) {
                            console.error('Error:', error);
                            displayError(resultContainer, '检测过程中发生错误，请重试'); // 显示错误信息
                        } finally {
                            clearInterval(timerInterval); // 停止计时器
                            document.getElementById('scanButton').style.display = 'block'; // 显示按钮
                            document.getElementById('uploadButton').style.display = 'block'; // 显示按钮
                            resultContainer.removeChild(loadingMessage);
                        }
                    })
                    .catch(function(err) {
                        console.error('Error reading file:', err);
                    });

            } else if (file.type === 'text/plain') {
                // 处理 .txt 文件
                const decoder = new TextDecoder();
                let fileContent = decoder.decode(event.target.result);
               // console.log('Text content extracted:', fileContent);
                // 调用封装的函数并处理结果
                (async () => {  // 添加一个异步立即执行函数
                    try {
                        const segments = splitText(fileContent); // 调用分段处理函数
                        await processSegments(segments, resultContainer); // 处理分段结果
                    } catch (error) {
                        console.error('Error:', error);
                        displayError(resultContainer, '检测过程中发生错误，请重试');
                    } finally {
                        clearInterval(timerInterval);
                        document.getElementById('scanButton').style.display = 'block';
                        document.getElementById('uploadButton').style.display = 'block';
                        resultContainer.removeChild(loadingMessage);
                    }
                })();  // 立即行
            }

        };

        reader.onerror = function(event) {
            console.error('FileReader error:', event.target.error);
        };
        reader.readAsArrayBuffer(file);
    };
    fileInput.click();
}); 
