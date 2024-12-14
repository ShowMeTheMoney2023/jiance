   // server.js
   const express = require('express');
   const bodyParser = require('body-parser');
   // 引入 axios 库
   const axios = require('axios'); // 确保引入 axios 库        
   const path = require('path');
   require('dotenv').config();

   const app = express();
   const PORT = process.env.PORT || 4000;

   app.use(bodyParser.json());

   // 提供静态文件
   app.use(express.static(__dirname)); // 更新静态文件目录为根目录

   // 处理根路径请求
   app.get('/', (req, res) => {
       res.sendFile(path.join(__dirname, 'index.html')); // 更新 index.html 的路径
   });


 /* 创建 API 端点
 app.post('/api/check-ai', async (req, res) => { // 将处理函数改为异步

    const text = req.body.text;

    console.log(`Received text: ${text}`); // 打印接收到的文本

    let isResponseSent = false; // 标志，确保只发送一次响应

    try {
        // 调用 Hugging Face Space API 处理模型判断
        const response = await axios.post('https://showme-adfnet.hf.space/predict', { text: text });
        const result = response.data.result; // 获取 API 返回的结果数组

        // 提取所需的信息，例如一个结果的标签和分数
        if (result && result.length > 0) {
            const sentiment = result[0]; // 获取第一个结果
            const score = sentiment.score; // 获取分数
            const aiProbability = (score * 100).toFixed(2); // 计算 AI 的概率
            const humanProbability = (100 - aiProbability).toFixed(2); // 计算 Human 的概率
            console.log(`Sentiment label: ${sentiment.label}, AI Probability: ${aiProbability}%, Human Probability: ${humanProbability}%`); // 添加打印语句
            const responseData = {
                label: sentiment.label, // 提取标签
                score: sentiment.score,  // 提取分数
                aiProbability: aiProbability, // 添加 AI 概率
                humanProbability: humanProbability // 添加 Human 概率
            };

            if (!isResponseSent) {
                res.json({ result: responseData }); // 返回提取后的结果
                isResponseSent = true; // 设置标志为已发送
            }
        } else {
            if (!isResponseSent) {
                res.status(500).send('No results returned from the model.');
                isResponseSent = true; // 设置标志为已发送
            }
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        if (!isResponseSent) {
            res.status(500).send('Error 500');
            isResponseSent = true; // 设置标志为已发送
        }
    }
});
*/
   // 启动服务器
   app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});