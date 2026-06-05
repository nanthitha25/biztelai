import { GoogleGenAI } from '@google/genai';

// Assume GEMINI_API_KEY is available in the environment
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function extractOperationalData(base64Image, mimeType) {
  const prompt = `
You are an expert OCR AI specializing in handwritten manufacturing operational documents. 
I am providing an image of a handwritten table with columns typically corresponding to:
- S. No
- Date
- Shift
- Emp. No
- Opn Code
- Machine No.
- Work Order No.
- Qty. Prod.
- Time taken (in hrs)

Your task is to accurately extract all rows of data into a JSON array. 
CRITICAL: You MUST extract exactly 10 rows matching the 10 rows on the physical paper, even if rows are completely blank. For blank rows, return empty strings for the fields, but include them in the JSON array so the operator can manually fill them later.
For each field, you must also provide a confidence score ("high", "medium", "low") based on how legible the handwriting is. 
If a field is empty, return an empty string.

Output ONLY a JSON array with this exact structure for each row (do not include markdown block wrapping):
[
  {
    "sequenceNo": "1",
    "date": "21/4/26",
    "shift": "1",
    "empNo": "BT4685",
    "opnCode": "856420",
    "machineNo": "MC-810",
    "workOrderNo": "165410",
    "qtyProd": "25",
    "timeTaken": "8.0",
    "confidence": {
      "sequenceNo": "high",
      "date": "high",
      "shift": "high",
      "empNo": "medium",
      "opnCode": "high",
      "machineNo": "high",
      "workOrderNo": "high",
      "qtyProd": "high",
      "timeTaken": "high"
    }
  }
]
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: base64Image
              }
            }
          ]
        }
      ]
    });

    let text = response.text;
    if (!text) {
        throw new Error("No text received from Gemini");
    }
    // Clean up potential markdown formatting
    if (text.startsWith('\`\`\`json')) {
      text = text.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
    } else if (text.startsWith('\`\`\`')) {
      text = text.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Extraction error:", error);
    throw error;
  }
}
