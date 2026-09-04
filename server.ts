import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON with higher size limits for file uploads/base64
  app.use(express.json({ limit: '20mb' }));

  // API Route: AI Document Recognition & Auto-Fill for Trademark Cases
  app.post('/api/recognize-trademark-file', async (req, res) => {
    try {
      const { fileData, mimeType, fileName, fileText } = req.body;

      if (!fileData && !fileText) {
        return res.status(400).json({ error: '请提供文件内容或Base64数据' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        // Fallback simulated parsing when API Key is not set or placeholder
        return res.json({
          success: true,
          mode: 'simulated',
          data: getMockExtractedData(fileName || '商标文件')
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const systemInstruction = `你是一位资深知识产权(IP)专家与商标数据提取系统。
你需要分析用户上传的商标官方通知书、注册证书、受理解决函、代理文件或知识产权文档，并准确提取其中的所有结构化字段。

请严格返回符合格式的JSON数据，包含以下字段（若文中未提及则留空字符串或空数组）：
- status: 案件流转状态，必须是以下枚举之一: 'PENDING_APPLY' (待申请), 'APPLYING' (申请中/下发受理通知书), 'EXAMINING' (审查中), 'PENDING_REPLY' (待答复/审查意见), 'REGISTERED' (已注册/核发证书), 'INVALID' (已失效)
- officialAgency: 知识产权主管局名称（如：国家知识产权局商标局 (CNIPA)、新加坡知识产权局 (IPOS)、美国专利商标局 (USPTO)）
- applicationNo: 官方申请号
- applyDate: 官方申请日 (YYYY-MM-DD格式)
- registrationNo: 官方注册号
- registrationDate: 官方注册日 (YYYY-MM-DD格式)
- initialIssueNo: 初审公告期号（如：1892期）
- initialIssueDate: 初审公告日 (YYYY-MM-DD格式)
- regIssueNo: 注册公告期号（如：1904期）
- regIssueDate: 注册公告日 (YYYY-MM-DD格式)
- filingDeadline: 申报或答复截止日期 (YYYY-MM-DD格式)
- rightsEndDate: 权利终止日/有效期止 (YYYY-MM-DD格式)
- renewalStartDate: 续展起始日 (YYYY-MM-DD格式)
- intlRegNo: 国际注册号
- intlRegDate: 国际注册日 (YYYY-MM-DD格式)
- applicant: 申请人主体名称（中文）
- applicantEn: 申请人英文名称
- applicantAddress: 申请人地址（中文）
- applicantAddressEn: 申请人英文地址
- agencyName: 承办代理机构或律所名称
- agentName: 承办代理人姓名
- agencyDocketNo: 代理机构案卷号
- priorityClaim: 优先权声明说明
- classes: 尼斯分类类别编号数组，字符串格式如 ["03", "10", "21"]
- goodsList: 指定保护商品或服务项目名称数组，格式如 ["电动牙刷 (2108)", "医用冲牙器 (1004)"]
- timelineStage: 提取到的最新进度节点简述（如：获准注册核发证书、下发商标驳回通知书、收到初审公告）`;

      const contentsParts: any[] = [];

      if (fileData) {
        contentsParts.push({
          inlineData: {
            mimeType: mimeType || 'image/png',
            data: fileData
          }
        });
      }

      if (fileText) {
        contentsParts.push({
          text: `文档文本内容如下：\n${fileText}`
        });
      }

      contentsParts.push({
        text: `请从上传的商标文档中分析并智能提取全部商标注册档案字段，以JSON格式输出。文件名：${fileName || '未知文件'}`
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: contentsParts },
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING },
              officialAgency: { type: Type.STRING },
              applicationNo: { type: Type.STRING },
              applyDate: { type: Type.STRING },
              registrationNo: { type: Type.STRING },
              registrationDate: { type: Type.STRING },
              initialIssueNo: { type: Type.STRING },
              initialIssueDate: { type: Type.STRING },
              regIssueNo: { type: Type.STRING },
              regIssueDate: { type: Type.STRING },
              filingDeadline: { type: Type.STRING },
              rightsEndDate: { type: Type.STRING },
              renewalStartDate: { type: Type.STRING },
              intlRegNo: { type: Type.STRING },
              intlRegDate: { type: Type.STRING },
              applicant: { type: Type.STRING },
              applicantEn: { type: Type.STRING },
              applicantAddress: { type: Type.STRING },
              applicantAddressEn: { type: Type.STRING },
              agencyName: { type: Type.STRING },
              agentName: { type: Type.STRING },
              agencyDocketNo: { type: Type.STRING },
              priorityClaim: { type: Type.STRING },
              classes: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              goodsList: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              timelineStage: { type: Type.STRING }
            }
          }
        }
      });

      const jsonText = response.text || '{}';
      const extractedData = JSON.parse(jsonText);

      return res.json({
        success: true,
        mode: 'ai',
        data: extractedData
      });

    } catch (error: any) {
      console.error('AI Trademark recognition error:', error);
      return res.status(500).json({
        error: '识别商标文件失败: ' + (error.message || '未知错误'),
        fallbackData: getMockExtractedData(req.body.fileName || '商标文件')
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.join(__dirname, 'index.html'))
      ? __dirname
      : path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

function getMockExtractedData(filename: string) {
  return {
    status: 'REGISTERED',
    officialAgency: '国家知识产权局商标局 (CNIPA)',
    applicationNo: '79201834',
    applyDate: '2026-03-15',
    registrationNo: 'REG-9912048',
    registrationDate: '2026-08-20',
    initialIssueNo: '1898期',
    initialIssueDate: '2026-05-20',
    regIssueNo: '1910期',
    regIssueDate: '2026-08-20',
    filingDeadline: '2026-11-20',
    rightsEndDate: '2036-08-19',
    renewalStartDate: '2036-02-19',
    intlRegNo: 'IR-2026-88019',
    intlRegDate: '2026-03-20',
    applicant: '广州星际悦动股份有限公司',
    applicantEn: 'Guangzhou Starfield Delight Co., Ltd.',
    applicantAddress: '广东省广州市天河区珠江东路28号越秀金融大厦38层',
    applicantAddressEn: '38/F, Yuexiu Financial Tower, No.28 Zhujiang East Road, Tianhe District, Guangzhou',
    agencyName: '华进联合知识产权代理有限公司',
    agentName: '张锦程',
    agencyDocketNo: 'HJ-2026-TM-9981',
    priorityClaim: '基于中国首次申请 202610891204.8 享有优先权',
    classes: ['03', '10', '21'],
    goodsList: [
      '电动牙刷 (2108)',
      '医用冲牙器 (1004)',
      '牙齿美白冷光仪 (1004)',
      '非医用漱口水 (0307)',
      '洁齿剂 (0307)'
    ],
    timelineStage: '获准注册并核发商标注册证书'
  };
}

startServer();
