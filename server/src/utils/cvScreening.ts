import mammoth from 'mammoth';

export const screenCV = async (filePath: string): Promise<{ isValid: boolean; discrepancies: string[] }> => {
    const discrepancies: string[] = [];
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        const text = result.value.toLowerCase();

        const requiredSections = [
            'personal information',
            'professional summary',
            'core competencies',
            'professional experience',
            'education & certifications'
        ];

        requiredSections.forEach(section => {
            if (!text.includes(section)) {
                discrepancies.push(`Missing required section: ${section.toUpperCase()}`);
            }
        });

        // Basic check for placeholder text
        const placeholders = ['[first]', '[last]', '[city, state, country]', '[phone number]', '[email address]'];
        placeholders.forEach(placeholder => {
            if (text.includes(placeholder)) {
                discrepancies.push(`Contains placeholder text: ${placeholder}`);
            }
        });

        return {
            isValid: discrepancies.length === 0,
            discrepancies
        };
    } catch (error) {
        console.error('[CVScreening] Error screening CV:', error);
        return {
            isValid: false,
            discrepancies: ['Failed to read CV file format. Ensure it is a valid .docx file based on the provided template.']
        };
    }
};
