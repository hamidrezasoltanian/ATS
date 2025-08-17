import { GoogleGenAI } from "@google/genai";

// To prevent crashing when running without a build process,
// we safely check for the API_KEY. The build process will replace
// process.env.API_KEY with the actual key.
let API_KEY: string | undefined;
try {
    API_KEY = process.env.API_KEY;
} catch (e) {
    API_KEY = undefined;
}


let ai: GoogleGenAI | null = null;
if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
}

const model = 'gemini-2.5-flash';

const generateContent = async (prompt: string): Promise<string> => {
    if (!ai) {
        return "خطا: قابلیت هوش مصنوعی پیکربندی نشده است. برای فعال‌سازی، برنامه را با دستور build و با ارائه کلید API اجرا کنید.";
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