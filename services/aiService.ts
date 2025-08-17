import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
}

const model = 'gemini-2.5-flash';

const generateContent = async (prompt: string): Promise<string> => {
    if (!ai) {
        return "خطا: کلید API برای سرویس هوش مصنوعی یافت نشد. لطفا از طریق پنل افزونه، کلید خود را در متغیرهای محیطی با نام API_KEY ثبت کنید.";
    }
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("AI service error:", error);
        if (error instanceof Error && (error.message.includes("API key not valid") || error.message.includes("API_KEY_INVALID"))) {
             return "خطا: کلید API معتبر نیست. لطفاً از صحیح بودن آن اطمینان حاصل کنید.";
        }
        return "خطا در برقراری ارتباط با سرویس هوش مصنوعی.";
    }
};

export const aiService = {
    generateTemplateContent: (purpose: string): Promise<string> => {
        const prompt = `به عنوان یک مدیر استخدام حرفه‌ای، یک قالب پیام به زبان فارسی برای این منظور بنویس: "${purpose}". از placeholder هایی مانند {{candidateName}} برای نام متقاضی و {{position}} برای موقعیت شغلی و {{interviewDate}} برای تاریخ مصاحبه در صورت لزوم استفاده کن. متن باید حرفه‌ای، صمیمی و واضح باشد.`;
        return generateContent(prompt);
    },
};
