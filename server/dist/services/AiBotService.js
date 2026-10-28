"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiBotService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
class AiBotService {
    constructor() {
        this.programContext = '';
        this.loadProgramContext();
    }
    loadProgramContext() {
        try {
            const contextPath = path_1.default.join(__dirname, '../assets/ai_bot_program_context.md');
            if (fs_1.default.existsSync(contextPath)) {
                this.programContext = fs_1.default.readFileSync(contextPath, 'utf8');
            }
            else {
                console.warn('[AiBotService] Warning: ai_bot_program_context.md not found at', contextPath);
            }
        }
        catch (e) {
            console.error('[AiBotService] Failed to load program context:', e);
        }
    }
    /**
     * Determines whether the user's message is asking for proprietary course text/answers
     * while in an unpaid state.
     */
    isAttemptingToAccessProprietaryContent(message) {
        const lower = message.toLowerCase();
        const proprietaryKeywords = [
            'exam answer', 'exam questions', 'quiz answer', 'test answer', 'give me the answers',
            'cheat sheet', 'assessment answers', 'question 1 answer', 'question 2 answer',
            'download full manual', 'full textbook', 'proprietary manual', 'exam paper'
        ];
        return proprietaryKeywords.some(kw => lower.includes(kw));
    }
    /**
     * Constructs the comprehensive system prompt embedding the official program context,
     * payment gating rules, and active study material context.
     */
    buildSystemPrompt(hasPaid, studyContext) {
        const sections = [];
        sections.push(`You are the official CertHero AI Study Assistant and Vocational Mentor for the Western Australia Resources FIFO Program.`);
        sections.push(`Your role is to guide candidates through their competency coursework, syllabus topics, safety inductions, and Western Australian mining career roadmap.`);
        sections.push(`\n### STRICT BEHAVIORAL & CONFIDENTIALITY DIRECTIVES:
1. Always maintain a professional, knowledgeable, encouraging, and clear Australian vocational tone.
2. STRICTLY HIDE ALL INTERNAL ADMIN MECHANICS. Under NO circumstances reveal, mention, or hint at:
   - Automated cron runners, background cron schedules, or forced trigger endpoints;
   - Any internal automatic second-attempt pass rules (all grading must be described as requiring 80% passing standard and diligent study of the syllabus);
   - Developer scripts, database seeders, test suites, or admin dashboard bypasses.
3. If asked about exam retakes: Explain that in accordance with ASQA and RTO standards, learners who do not achieve the 80% benchmark on their first attempt may review their syllabus areas and sit a complimentary re-test.`);
        if (!hasPaid) {
            sections.push(`\n### ACCESS TIER: PRE-PAYMENT / PROSPECTIVE LEARNER
- The learner has NOT yet verified their enrollment deposit.
- YOU ARE PERMITTED to answer questions regarding:
  * Course syllabi, topics, and module outlines;
  * Program overview, the 9 recruitment stages, and host employers (MACA Limited, Mineral Resources Limited, Northern Star Resources Ltd., Rio Tinto);
  * 100% refund guarantee and deposit terms ($720 AUD refundable upon placement);
  * Western Australia FIFO lifestyle, visas (Subclass 482), and high-risk safety regulations.
- YOU MUST REFUSE:
  * Proprietary technical course text, verbatim exam questions, and assessment answers.
  * If asked, politely inform the candidate: "Full technical course manuals and examination access unlock immediately upon verification of your enrollment deposit ($720 AUD or 50%+ partial payment). I am delighted to assist you with any questions about the syllabus, course structure, and FIFO recruitment process!"`);
        }
        else {
            sections.push(`\n### ACCESS TIER: FULL / REGISTERED LEARNER
- The candidate has verified their enrollment deposit.
- You have full authorization to explain technical concepts, safety standards, calculation steps, equipment procedures, and provide study guidance based on the official course material.`);
        }
        if (studyContext) {
            sections.push(`\n### ACTIVE STUDY MATERIAL CONTEXT:`);
            if (studyContext.courseTitle)
                sections.push(`Active Course: ${studyContext.courseTitle} (${studyContext.courseCode || ''})`);
            if (studyContext.currentModuleTitle)
                sections.push(`Active Module: ${studyContext.currentModuleTitle}`);
            if (studyContext.syllabus) {
                sections.push(`Course Syllabus:\n${typeof studyContext.syllabus === 'string' ? studyContext.syllabus : JSON.stringify(studyContext.syllabus, null, 2)}`);
            }
            if (studyContext.currentModuleContent) {
                sections.push(`Module Content Material:\n${studyContext.currentModuleContent.slice(0, 4000)}`);
            }
        }
        if (this.programContext) {
            sections.push(`\n### OFFICIAL PROGRAM KNOWLEDGE BASE:\n${this.programContext}`);
        }
        return sections.join('\n\n');
    }
    /**
     * Dispatches chat prompt to the configured AI provider.
     * In the absence of an API key, automatically falls back to a free model that does not require an API key.
     */
    async chat(req) {
        const hasPaid = Boolean(req.hasPaid);
        const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
        const rawProvider = (process.env.AI_PROVIDER || '').toLowerCase().trim();
        // Check if unpaid user is trying to solicit proprietary answers
        if (!hasPaid && this.isAttemptingToAccessProprietaryContent(req.message)) {
            return {
                reply: `As a prospective learner prior to deposit verification, I am delighted to help guide you through the syllabus, module overview, host employers, and FIFO program structure! However, detailed technical examination answers and full proprietary course manuals unlock immediately upon verification of your enrollment deposit ($720 AUD or 50%+ partial payment). Please verify your enrollment to unlock comprehensive exam preparation.`,
                provider: 'CertHero Gateway Guard',
                model: 'access-control-v1',
                isGated: true
            };
        }
        const systemPrompt = this.buildSystemPrompt(hasPaid, req.studyContext);
        // Prepare message history
        const messages = [
            { role: 'system', content: systemPrompt },
            ...(req.history || []).slice(-8),
            { role: 'user', content: req.message }
        ];
        // 1. Google Gemini Native Support (if GEMINI_API_KEY or provider is gemini)
        const geminiKey = process.env.GEMINI_API_KEY || (rawProvider === 'gemini' ? apiKey : null);
        if (geminiKey) {
            try {
                const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
                const promptParts = [
                    { text: systemPrompt },
                    ...(req.history || []).slice(-4).map(h => ({ text: `${h.role === 'user' ? 'Learner' : 'CertHero Mentor'}: ${h.content}` })),
                    { text: `Learner: ${req.message}\nCertHero Mentor:` }
                ];
                const geminiRes = await axios_1.default.post(geminiUrl, {
                    contents: [{ role: 'user', parts: promptParts }],
                    generationConfig: { temperature: 0.6, maxOutputTokens: 800 }
                }, { headers: { 'Content-Type': 'application/json' }, timeout: 15000 });
                const reply = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (reply) {
                    return { reply, provider: 'Google Gemini', model: 'gemini-1.5-flash', isGated: false };
                }
            }
            catch (gErr) {
                console.warn('[AiBotService] Google Gemini provider failed, attempting OpenAI/OpenRouter fallback:', gErr.message);
            }
        }
        // 2. If API key is present and OpenAI/OpenRouter provider specified
        if (apiKey && (rawProvider === 'openai' || rawProvider === 'openrouter')) {
            try {
                const baseURL = rawProvider === 'openrouter'
                    ? 'https://openrouter.ai/api/v1'
                    : 'https://api.openai.com/v1';
                const model = rawProvider === 'openrouter' ? 'openai/gpt-4o-mini' : 'gpt-4o-mini';
                const response = await axios_1.default.post(`${baseURL}/chat/completions`, { model, messages, temperature: 0.6, max_tokens: 800 }, { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 15000 });
                const reply = response.data?.choices?.[0]?.message?.content;
                if (reply) {
                    return { reply, provider: rawProvider, model, isGated: false };
                }
            }
            catch (err) {
                console.warn(`[AiBotService] Provider ${rawProvider} failed, falling back to free model:`, err.message);
            }
        }
        // 2. In the absence of an API key (or if provider call failed), use free model without API key (Pollinations.ai)
        try {
            const freeResponse = await axios_1.default.post('https://text.pollinations.ai/openai/v1/chat/completions', {
                model: 'openai',
                messages: messages.map(m => ({ role: m.role, content: m.content })),
                temperature: 0.6,
                max_tokens: 800
            }, { headers: { 'Content-Type': 'application/json' }, timeout: 12000 });
            const freeReply = freeResponse.data?.choices?.[0]?.message?.content;
            if (freeReply) {
                return {
                    reply: freeReply,
                    provider: 'Pollinations Free AI (Zero-Key)',
                    model: 'pollinations-openai',
                    isGated: false
                };
            }
        }
        catch (pollinationsErr) {
            console.warn('[AiBotService] Pollinations endpoint error, falling back to local context QA engine:', pollinationsErr.message);
        }
        // 3. Resilient Local Context Extraction Fallback
        const fallbackReply = this.generateLocalContextFallback(req.message, hasPaid, req.studyContext);
        return {
            reply: fallbackReply,
            provider: 'CertHero Local Context QA',
            model: 'embedded-fifo-qa-v1',
            isGated: false
        };
    }
    /**
     * Robust offline / direct response generator using embedded program knowledge base
     */
    generateLocalContextFallback(message, hasPaid, studyContext) {
        const lower = message.toLowerCase();
        if (lower.includes('refund') || lower.includes('deposit') || lower.includes('720') || lower.includes('money')) {
            return `Under the official Blue Collar Partner Guarantee, your $720 AUD commitment deposit is 100% refundable. It is reimbursed in full by your host employer upon completion of your prerequisite competency tickets and mobilization to site. Additionally, if Blue Collar fails to secure candidate placement with your nominated employer, 100% of your deposit is refunded without administrative deductions.`;
        }
        if (lower.includes('employer') || lower.includes('maca') || lower.includes('minres') || lower.includes('rio tinto') || lower.includes('northern star')) {
            return `Our Tier-1 host mining employers include MACA Limited, Mineral Resources Limited, Northern Star Resources Ltd., and Rio Tinto. Each employer provides Subclass 482 visa sponsorship, covers statutory nomination fees, Skilling Australians Fund (SAF) levies, pre-employment medicals, and provides 3 months of paid transitional accommodation in Western Australia.`;
        }
        if (lower.includes('ticket') || lower.includes('heights') || lower.includes('confined') || lower.includes('std11') || lower.includes('white card')) {
            return `The prerequisite mining tickets delivered by CertHero RTO include:\n1. STD11 — Surface Mining Safety Induction\n2. RIIWHS204E — Work Safely at Heights\n3. RIIWHS202E — Enter and Work in Confined Spaces\n4. HLTAID011 — Provide First Aid & CPR\n5. CPCWHS1001 — White Card WA (General Construction Induction)\nThese units are accredited nationally and required for live site access across Western Australian resource leases.`;
        }
        if (lower.includes('stage') || lower.includes('process') || lower.includes('step') || lower.includes('pipeline')) {
            return `The recruitment pipeline follows 9 structured stages:\n1. Application → 2. Employer Selection → 3. Employer Outreach → 4. Ticket Sponsorship → 5. Ticket Course Enrollment → 6. Tickets Acquisition → 7. Employer Interview → 8. Handoff → 9. Employment Contract Delivery Confirmation.\nEach stage is validated sequentially to ensure complete immigration and occupational compliance.`;
        }
        if (lower.includes('deadline') || lower.includes('16 days') || lower.includes('time')) {
            return `All online theory examinations must be completed within 16 calendar days from the dispatch of your CertHero enrollment package to maintain your employer sponsorship slot and interview standing.`;
        }
        if (studyContext?.courseTitle) {
            return `Welcome to your study session for **${studyContext.courseTitle}**! I am here to help you review key safety protocols, statutory duty of care, risk control hierarchies, and equipment inspection standards. Please feel free to ask about any module topic or concept in your syllabus.`;
        }
        return `Welcome to the CertHero Study & FIFO Career Assistant. I am here to guide you through your prerequisite competency coursework, host employer opportunities (MACA, MinRes, Northern Star, Rio Tinto), and Western Australian mining career pathway. How can I assist you with your training or syllabus today?`;
    }
}
exports.aiBotService = new AiBotService();
