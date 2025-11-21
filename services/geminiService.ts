import { GoogleGenAI } from "@google/genai";

export const convertMarkdownToHtml = async (markdown: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please enter your Gemini API Key in the settings.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an expert document formatter. 
    Convert the following Markdown text into semantic HTML that is optimized for copying and pasting directly into Google Docs.
    
    Rules:
    1. **Tables**: This is the most important part. You MUST format tables using standard HTML <table> tags. 
       - Add \`border="1"\` attribute to the table tag.
       - Add inline styles to the table: \`style="border-collapse: collapse; width: 100%; border: 1px solid #000;"\`
       - Add inline styles to every <th> and <td>: \`style="border: 1px solid #000; padding: 8px;"\`
       - This ensures grid lines appear clearly when pasted.
    2. **Clean Formatting**: Remove all Markdown artifacts (asterisks, hashes, backticks).
    3. **Typography**: 
       - Use proper headings (<h1>, <h2>).
       - **IMPORTANT**: Do NOT use bold for headings. Headings should be standard weight.
       - Do NOT use <hr> tags or horizontal lines.
    4. **Lists**: Use <ul> and <ol> with <li>.
    5. **Output**: Return ONLY the raw HTML string inside the response. No \`\`\`html blocks.

    Input Markdown:
    ${markdown}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let html = response.text || "";
    
    // 1. Remove Markdown code blocks if present
    html = html.replace(/^```html\s*/i, '').replace(/\s*```$/, '');

    // 2. NUCLEAR OPTION: Remove all <hr> tags (self-closing or normal)
    html = html.replace(/<hr\s*\/?>/gi, '');
    html = html.replace(/<hr>/gi, '');

    // 3. FORCE NON-BOLD HEADINGS: Inject inline style into h1-h6 tags
    // Renamed 'match' to '_match'
    html = html.replace(/<h([1-6])(.*?)>/gi, (_match, level, attributes) => {
      // If style already exists, append to it; otherwise add it
      if (attributes.includes('style="')) {
        return `<h${level}${attributes.replace('style="', 'style="font-weight: normal; ')}>`;
      } else {
        return `<h${level} style="font-weight: normal;"${attributes}>`;
      }
    });

    return html;
  } catch (error) {
    console.error("Error converting markdown:", error);
    throw error;
  }
};