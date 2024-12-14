// 封装调用 Hugging Face API 的函数（私有）
async function checkAI(text, key) {
    try {
        const response = await axios.post('https://showme-adfnet.hf.space/predict', { text: text }, {
            headers: { 'Authorization': `Bearer ${key}` }
        });
        const result = response.data.result; // 获取 API 返回的结果数组

        if (result && result.length > 0) {
            const score = result[0].score; // 直接获取分数，忽略 label
            const aiProbability = parseFloat((score * 100).toFixed(2)); // 确保返回数字类型
            const humanProbability = parseFloat((100 - aiProbability).toFixed(2)); // 确保返回数字类型

            //console.log('checkAI:', { aiProbability, humanProbability }); // 打印结果
            return { aiProbability, humanProbability }; // 返回计算结果
        } else {
            throw new Error('No results returned from the model.');
        }
    } catch (error) {
        throw new Error('Error calling the AI model: ' + error.message);
    }
}

// 新的 API 接口处理函数
async function checkAI02(text, key) {
    try {
        const response = await axios.post('https://showme-adfnet2.hf.space/predict', { text: text }, {
            headers: { 'Authorization': `Bearer ${key}` }
        });
        const result = response.data.result; // 获取 API 返回的结果数组

        if (result && result.length > 0) {
            const score = result[0].score; // 直接获取分数，忽略 label
            const aiProbability = parseFloat((score * 100).toFixed(2)); // 确保返回数字类型
            const humanProbability = parseFloat((100 - aiProbability).toFixed(2)); // 确保返回数字类型

           // console.log('checkAI02:', { aiProbability, humanProbability }); // 打印结果
            return { aiProbability, humanProbability }; // 返回计算结果
        } else {
            // console.error('checkAI02: No results returned from the model for input:', text); // 添加日志
            throw new Error('No results returned from the alternative model.');
        }
    } catch (error) {
        //console.error('checkAI02: Error calling the alternative AI model:', error.message); // 添加日志
        throw new Error('Error calling the alternative AI model: ' + error.message);
    }
}

async function checkAI03(text, key) {
    try {
        const response = await axios.post('https://showme-adfnet-c.hf.space/predict', { text: text }, {
            headers: { 'Authorization': `Bearer ${key}` }
        });
       // console.log('Response:', response); // 打印整个 response 对象
       // console.log('Response Data:', response.data); // 打印 response.data
        const result = response.data.result; // 获取 API 返回的结果数组

        if (result && result.length > 0) {
            const score = result[0].score; // 直接获取分数，忽略 label
            const aiProbability = parseFloat((score * 100).toFixed(2)); // 确保返回数字类型
            const humanProbability = parseFloat((100 - aiProbability).toFixed(2)); // 确保返回数字类型

            // console.log('checkAI03:', { aiProbability, humanProbability }); // 打印结果
            return { aiProbability, humanProbability }; // 返回计算结果
        } else {
           // console.error('checkAI03: No results returned from the model for input:', text); // 添加日志
            throw new Error('No results returned from the alternative model.');
        }
    } catch (error) {
       // console.error('checkAI03: Error calling the alternative AI model:', error.message); // 添加日志
        throw new Error('Error calling the alternative AI model: ' + error.message);
    }
}

// 假设您在这里直接定义了 API Key
const AI_API_KEY = 'showme'; // 直接定义 API Key

// 公共接口函数，外部调用此函数
export async function analyzeText(text) {
    const result01 = await checkAI(text, AI_API_KEY); // 直接使用定义的 API Key
   // console.log('checkAI 结果:', result01); // 打印结果

    const result02 = await checkAI02(text, AI_API_KEY); // 调用新的 API 接口
   // console.log('checkAI02 结果:', result02); // 打印结果

    const result03 = await checkAI03(text, AI_API_KEY); // 调用新的 API 接口
   // console.log('checkAI03 结果:', result03); // 打印结果

    return { result01, result02, result03 }; // 返回两个 API 的结果
} 