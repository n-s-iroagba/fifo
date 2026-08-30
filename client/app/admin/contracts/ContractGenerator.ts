import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function loadImageBase64(url: string): Promise<{ data: string, width: number, height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                resolve({
                    data: canvas.toDataURL('image/jpeg'),
                    width: img.width,
                    height: img.height
                });
            } else {
                reject(new Error('Failed to get canvas context'));
            }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
    });
}

export async function generateContractPDF(applicant: any, nomination: any, dateStr: string, tickets: any[] = []): Promise<Blob> {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    let y = 15;
    let pageCount = 1;

    const addFooter = () => {
        const totalPages = doc.internal.pages.length - 1;
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${i}`, 190, 290, { align: 'right' });
            doc.text('Blue Collar Recruitment Pty Limited (BCR-FIFO-2026-0810) - Strictly Confidential', 14, 290);
        }
    };

    const checkPageBreak = (heightNeeded: number) => {
        if (y + heightNeeded > 280) {
            doc.addPage();
            pageCount++;
            y = 15;
        }
    };

    const addText = (text: string, size = 10, isBold = false, indent = 14, color = [0, 0, 0] as [number, number, number]) => {
        if (!text) return;
        doc.setFontSize(size);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setTextColor(color[0], color[1], color[2]);

        const maxWidth = 210 - indent - 14;
        const lines = doc.splitTextToSize(text, maxWidth);

        lines.forEach((line: string) => {
            checkPageBreak(size * 0.4 + 2);
            doc.text(line, indent, y);
            y += (size * 0.4) + 1.5;
        });
        y += 2;
    };

    // Attempt to load logo
    try {
        const logo = await loadImageBase64('/email-logo.jpg');
        const imgRatio = logo.height / logo.width;
        const imgHeight = 40 * imgRatio;
        doc.addImage(logo.data, 'JPEG', 14, y, 40, imgHeight);
        y += imgHeight + 8;
    } catch (e) {
        // Logo failed to load, continue without it
        console.warn('Failed to load email-logo.jpg for PDF');
    }

    const companySub = applicant.subsidyPercentage ? Number(applicant.subsidyPercentage).toFixed(2) : '96.38';
    const candidateSub = (100 - Number(companySub)).toFixed(2);

    const nationality = applicant.nationality || '[Applicant Country of Citizenship]';
    const residence = applicant.countryOfResidence || '[Applicant Country of Residence]';
    const passport = applicant.passportNumber || '[____________________]';

    let precalcCandidateShare = 0;
    if (tickets && tickets.length > 0) {
        tickets.forEach((ticket: any) => {
            if (ticket.status === 'not_possessed') {
                const totalCost = parseFloat(ticket.realPrice || ticket.purchasePrice || '0');
                const compAmount = (totalCost * Number(companySub)) / 100;
                const candAmount = totalCost - compAmount;
                precalcCandidateShare += candAmount;
            }
        });
    }
    const audTotal = precalcCandidateShare.toFixed(2);
    const usdtTotal = (precalcCandidateShare * 0.67).toFixed(2);

    const contentBlocks = [
        { type: 'header', text: 'Blue Collar Recruitment Pty Limited', size: 14, bold: true, color: [0, 0, 128] },
        { type: 'spacer', space: 2 },
        { type: 'header', text: 'FIFO EMPLOYMENT TICKETING, TRAINING & VISA SPONSORSHIP CANDIDATE AGREEMENT', size: 11, bold: true },
        { type: 'text', text: 'DOCUMENT REF: BCR-FIFO-2026-0810', size: 9, color: [80, 80, 80] },
        { type: 'text', text: 'STRICTLY CONFIDENTIAL', size: 9, color: [80, 80, 80] },
        { type: 'text', text: `DATE OF INSTRUMENT: ${dateStr}`, size: 9, color: [80, 80, 80] },
        { type: 'spacer', space: 4 },

        { type: 'header', text: '1. PARTIES', size: 11, bold: true },
        { type: 'text', text: `This Binding Agreement (hereinafter referred to as the "Agreement" or "Instrument") is made and entered into on this ${dateStr}, by and between:` },
        { type: 'text', text: 'THE COMPANY: Blue Collar Recruitment Pty Limited (BC Recruit Pty Ltd) (ACN: 105 263 151 / ABN: 67 105 263 151), a licensed labor hire, workforce deployment, and recruitment enterprise duly incorporated under the laws of Australia, having its principal corporate headquarters located at Suite 213/35-37 Doody St, Alexandria, New South Wales, 2015, Australia (hereinafter referred to as "the Company").' },
        { type: 'text', text: `THE CANDIDATE: ${applicant.fullName}, an individual national of ${nationality}, currently residing within ${residence}, holder of International Passport Number: ${passport} (hereinafter referred to as "the Candidate").` },
        { type: 'text', text: 'THE TRAINING PARTNER: Aveling (RTO Provider Code: 50503), an accredited Registered Training Organisation registered in the state of Western Australia, contracted by the Company to deliver industry-specific competency courses. The Candidate explicitly acknowledges that Aveling is a non-party to this Agreement, and its operational liabilities are governed separately under its autonomous educational enrollment framework.' },
        { type: 'text', text: 'Collectively, the Company and the Candidate shall be formally designated within this Instrument as "the Parties" and individually as "a Party."' },
        { type: 'spacer', space: 4 },

        { type: 'header', text: '2. BACKGROUND & RECITALS', size: 11, bold: true },
        { type: 'text', text: 'WHEREAS:' },
        { type: 'text', text: 'The Company operates an international recruitment infrastructure specializing in sourcing, certifying, and deploying qualified candidates into domestic Fly-In Fly-Out (FIFO) industrial roles within the resources, mining, energy, and infrastructure sectors of the Commonwealth of Australia.' },
        { type: 'text', text: 'The Candidate has formally applied for structural career placement and requires specific vocational competencies, safety credentials, a verified skills assessment, and a lawful visa pathway to qualify for operational placement with the Company’s heavy-industry clients.' },
        { type: 'text', text: 'The Company possesses approved Standard Business Sponsor (SBS) status under the Migration Act 1958 (Cth) and is prepared to formally nominate the Candidate for international mobilization under the Skills in Demand (Subclass 482) temporary visa framework, subject to the Candidate’s reciprocal compliance with the academic, vocational, and chronological performance milestones established herein.' },
        { type: 'spacer', space: 4 },

        { type: 'header', text: '3. DEFINITIONS & INTERPRETATION', size: 11, bold: true },
        { type: 'text', text: 'In this Agreement, unless the context otherwise requires, the following terms shall have the explicit meaning assigned to them:' },
        { type: 'text', text: '“Ticket(s)” or “Certifications”: The industry-standard, nationally recognized units of competency, safety inductions, core hazardous area certifications, and resource sector entry programs itemized within Schedule 1 of this Instrument, systematically provisioned and verified by the designated Training Partner.' },
        { type: 'text', text: '“TRA Assessment”: The formal offshore skills assessment framework administered by Trades Recognition Australia (TRA) to evaluate the Candidate’s technical trade qualifications and international employment history.' },
        { type: 'text', text: '“OTSR (Offshore Technical Skills Record)”: The official credential issued by Trades Recognition Australia (TRA) upon successful completion of the offshore skills assessment, confirming that the Candidate meets the technical competencies required to apply for a provisional Australian trade licence.' },
        { type: 'text', text: `“Sponsorship Contribution”: The explicit fiscal percentage allocation of eligible educational, administrative, and visa application outlays that the Company covenants to absorb or subsidize on behalf of the Candidate (currently set at ${companySub}%).` },
        { type: 'text', text: '“Candidate Wallet”: An internal, verifiable corporate digital ledger maintained by the accounting infrastructure of the Company, serving to accurately record valid security deposits advanced by the Candidate alongside corresponding credits or success-based reimbursements accrued.' },
        { type: 'text', text: '“Contract Return Date”: The calendar date upon which the Candidate returns a fully executed, un-amended copy of this complete Agreement to the authorized agents of the Company.' },
        { type: 'text', text: '“Process”: The total integrated chronological sequence of milestones spanning the execution of this Instrument, initial capital deposits, completion of remote educational theory modules, TRA assessment clearances, medical screenings, lodging of immigration petitions, physical transit, and physical practical assessments, as structured under Schedule 2.' },
        { type: 'text', text: `“Nomination Position”: The specific, designated employment classification of ${nomination.tradeStream} at ${nomination.hostEmployer} – Fly-In Fly-Out (FIFO), mapped under the Australian and New Zealand Standard Classification of Occupations (ANZSCO) structural codes, deployed on behalf of the host client Company to be filled later. The placement will encompass high-yield operations inside Western Australia's mining regions.` },
        { type: 'text', text: '"Licensing Charges": The statutory regulatory fees enforced by the Western Australia Department of Transport (DoT) required to finalize local operating compliance, specifically consisting of the Computerised Theory Test (CTT), the Practical Driving Assessment (PDA), and the 1-Year Full Licence Card Fee.' },
        { type: 'text', text: '"Assessment Attempt": A single, formal evaluation instance of an individual module or assessment block. Under Australian standards, this incorporates the baseline initial examination and, where required, an individual re-assessment event up to the permissible ceiling.' },
        { type: 'spacer', space: 4 },

        { type: 'header', text: '4. FISCAL SPONSORSHIP & COMPANY COVENANTS', size: 11, bold: true },
        { type: 'text', text: 'Conditional upon the Candidate remaining in absolute standing and fulfilling every chronological requirement set out in Clause 6 and Schedule 2, the Company covenants to execute the following financial provisions:' },
        { type: 'text', text: `4.1 Vocational Training Subsidy: The Company shall directly fund ${companySub} percent (${companySub}%) of the total gross commercial fees charged by the Training Partner for the administration and assessment of each individual course block, safety induction, and specialized modules listed under Schedule 1.` },
        { type: 'text', text: '4.2 Visa Charge Apportionment: The Company shall fund one hundred percent (100%) of the statutory Visa Application Charge (VAC) applicable to the Subclass 482 visa framework in strict compliance with Regulation 2.87 of the Migration Regulations 1994 (Cth).' },
        { type: 'text', text: '4.3 Statutory Cost Exclusions: The Company explicitly guarantees that it shall not seek, directly or indirectly, to transfer, defer, claw back, withhold, or recover from the Candidate any regulatory costs which Australian migration law mandates must be borne exclusively by the sponsor. The Company shall pay one hundred percent (100%) of the following, without exception:\n- Standard Business Sponsorship (SBS) application processing fees (A$420.00);\n- Employer Nomination application processing fees (A$330.00);\n- The full applicable Skilling Australians Fund (SAF) Levy (A$2,400.00);\n- All corporate-level immigration legal fees, processing fees, or migration agency consultancy retainers relating to the sponsorship and nomination architecture.' },
        { type: 'text', text: '4.4 Initial Mobilization Accommodation Support: The Company covenants to arrange, manage, and completely fund the Candidate\'s residential accommodation within the state of Western Australia for an initial, continuous duration of three (3) calendar months commencing immediately from the Candidate\'s physical arrival. This mobilization benefit is strictly capped at a maximum corporate expenditure threshold of fifteen thousand Australian dollars (A$15,000.00) and is explicitly contingent upon the Candidate remaining continuously engaged with the assigned client enterprise and avoiding any event of material breach or voluntary abandonment.' },
        { type: 'spacer', space: 4 },

        { type: 'header', text: '5. CANDIDATE FINANCIAL OBLIGATIONS & DEPOSIT PROTOCOLS', size: 11, bold: true },
        { type: 'text', text: `5.1 Initial Commitment Deposit: Prior to the booking, scheduling, or corporate funding of any individual online module or Certification block with the Training Partner, the Candidate shall transfer a security deposit of ${usdtTotal} USDT. This deposit serves as an essential instrument of mutual commercial assurance, confirming the Candidate’s earnest and binding commitment to complete the workflow and protecting the corporate capital of the Company from losses arising due to sudden, un-notified candidate withdrawal.` },
        { type: 'text', text: `5.2 Expense Caps & Balance Accountability: The Candidate retains absolute personal liability for the remaining ${candidateSub} percent (${candidateSub}%) balance of itemized Ticket and Induction training costs, 100% of individual regional Western Australian regulatory driving licensing outlays, and 100% of statutory fees levied by Trades Recognition Australia (TRA). The Candidate’s absolute cumulative financial exposure under this entire Instrument is strictly capped subject to downward adjustment upon the activation of success-based wallet credits as defined within Clause 7.` },
        { type: 'spacer', space: 4 },

        { type: 'header', text: '6. CANDIDATE PERFORMANCE MILESTONES & TIMELINE EXECUTION', size: 11, bold: true },
        { type: 'text', text: 'The Candidate explicitly covenants to execute every milestone detailed below within the rigorous parameters of the chronological timeline, which is summarized visually within Schedule 2. Time is of the essence in respect of all obligations contained inside this Clause:' },
        { type: 'text', text: '6.1 Execution and Return Window: The Candidate must execute and return this complete, unaltered Agreement via authorized digital or physical channels within exactly twenty four (24) hours of receipt from the Company.' },
        { type: 'text', text: '6.2 Identity and Passport Documentation: The Candidate must provide a certified, high-resolution digital color scan of their valid passport to the Company within a maximum duration of three (3) weeks calculated from the initial transmittal date of this Agreement.' },
        { type: 'text', text: '6.3 Remote Theoretical Examination Delivery: The Candidate must formally enrol in, engage with, and complete the entirety of the remote, self-paced online theoretical components and associated educational assessments via the training partner portal while residing in their home country. This explicitly encompasses the core theoretical units of the safety inductions and regular technical tickets. All such theoretical examination milestones must be finalized within two (2) calendar weeks of the Contract Return Date.' },
        { type: 'text', text: '6.4 Arrival-Based Practical Assessments: The Candidate acknowledges that high-risk physical modules and mining induction criteria require in-person validation to comply with Australian safety frameworks. The Candidate covenants to present themselves at the designated training facility in Perth, Western Australia, to complete all physical demonstrations, safety scenarios, and practical equipment handling modules within the first seven (7) calendar days of arrival.' },
        { type: 'text', text: '6.5 Regional Driving Readiness & Licensing Testing: The Candidate must present themselves to an official Western Australia Department of Transport (DoT) licensing location within fourteen (14) days of physical arrival to complete the Computerised Theory Test (CTT) and schedule the execution of their Practical Driving Assessment (PDA) to clear local driving authorizations.' },
        { type: 'text', text: '6.6 Statutory Re-Examination & Assessment Retake Protocols: In alignment with Australian vocational education frameworks managed by the Australian Skills Quality Authority (ASQA) and Western Australian Department of Transport statutory criteria, assessment boundaries are rigorously capped to preserve structural competence standards:\n6.6.1 Standard Initial Attempt and Retake Allowance: The Candidate is authorized a maximum of two (2) sequential assessment attempts in total to successfully clear any individual vocational ticket module, safety induction unit, technical trade clearance exam, or DoT driving evaluation stream.\n6.6.2 First Attempt Retake Management: In the event that the Candidate fails to secure a passing grade on their initial attempt of any assessment, they must instantly activate standard remediation processes. The single permissible second attempt (retake) must be executed within forty-eight (48) hours for remote online theory modules, or within a timeline dictated directly by the local testing administrator for practical and driving streams.\n6.6.3 Strict Binary Threshold: The Candidate is explicitly prohibited from pursuing a third (3rd) attempt or any further continuous re-testing inside the parameters of this Agreement\'s financial structures. A secondary consecutive failure represents an automatic academic default event.' },
        { type: 'text', text: '6.7 Aggregate Process Completion: The entire preliminary workflow spanning contract return, online theoretical certifications, TRA skills clearance, medical results, and visa-readiness must be executed in full within one (1) single calendar month of the Contract Return Date, unless a formal extension is granted by the Company in writing.' },
        { type: 'text', text: '6.8 Interview Protocols: The Candidate must make themselves available for a mandatory screening and operational phone interview with the Company’s recruitment leadership immediately following the verifiable completion and passing of their first online Certification block.' },
        { type: 'text', text: '6.9 Mobilization Readiness: The Candidate must maintain constant logistical readiness to execute immigration application documents and initiate international transit to Australia within four (4) weeks of reaching visa-ready status, subject only to sovereign Department of Home Affairs processing backlogs outside human control.' },
        { type: 'text', text: '6.10 Medical Fit-for-Work & Screening Protocols: The Candidate must completely satisfy a dual-tiered health validation architecture, split across statutory immigration requirements and regional heavy-industry occupational safety mandates. Passing outcomes in both areas represent an absolute, non-negotiable prerequisite for visa issuance, mobilization, and site deployment:\n6.10.1 Subclass 482 Visa Medical Requirements (Immigration Path): Concurrently with the lodgement of the visa application, the Department of Home Affairs will trigger mandatory offshore health examinations based on the Candidate’s nationality. These must be performed by an authorized panel physician inside an approved global affiliate clinic and consist of:\n- Chest X-ray (Form 160): Required for candidates aged 11 and older to satisfy clearing criteria for active Tuberculosis (TB).\n- Medical Examination (Form 501): A standardized full general physical assessment executed by the panel physician.\n- Serum Creatinine / eGFR Blood Test: Required for candidates over 15 years of age to explicitly clear kidney function safety baselines.\nScope Note: Because the Candidate is being nominated for a technical trade infrastructure role rather than a healthcare, childcare, or classroom educational teaching stream, tests for HIV or Hepatitis will not be automatically generated for this temporary visa subclass.\n6.10.2 Industry-Specific FIFO Medical Requirements (Employer Path): Fully independent of the statutory visa path, Western Australia\'s mining sector mandates strict, non-negotiable physical clearings. The Company or its industrial client shall deploy the Candidate to a specific commercial occupational health provider (scheduled upon physical arrival in Perth or at a designated domestic hub) to complete a comprehensive fit-for-work evaluation consisting of:\n- Instant Drug & Alcohol Screening: Absolute zero-tolerance urine and breath analysis screening, performed during the baseline medical and subject to ongoing random on-site testing.\n- Audiometric Testing: A baseline hearing evaluation to systematically establish sensory baselines for long-term tracking around site heavy machinery.\n- Spirometry: Comprehensive lung-function tracking to assess performance resilience against regional mine dust exposure.\n- Functional Capacity Assessment: Specialized physical strength, ergonomic endurance, and lifting checks to verify the Candidate can safely manage demanding 12-hour swing roster shifts.' },
        { type: 'text', text: '6.11 Integrity of Disclosures: The Candidate must provide strictly authentic, accurate, comprehensive, and untampered documentation throughout the lifecycle of this agreement. The Candidate is under a continuous legal obligation to instantly notify the Company of any material shift in personal circumstances, including hidden medical conditions, criminal convictions, charges, or historical visa rejections from any global sovereign jurisdiction.' },
        { type: 'text', text: '6.12 Safe Harbour for Unforeseen Delays: In the event that a milestone cannot be met due to a verifiable force majeure event or standard external disruption (such as severe physical illness, certified governmental processing gridlocks, or unexpected technical outages on the educational network), the Candidate must instantly notify the Company. The Parties agree to negotiate a reasonable chronological variation in good faith, and such disruptions shall not be deemed a contract breach.' },
        { type: 'text', text: '6.13 Offshore Technical Skills Recognition (TRA Pathway): The Candidate must formally complete an offshore skills assessment through Trades Recognition Australia (TRA) while operating from their home jurisdiction. It is a strict material condition of employment that the Candidate successfully obtains an Offshore Technical Skills Record (OTSR). This record represents the absolute baseline necessary to verify structural trade equivalence for temporary immigration sponsorship and to facilitate the rapid onboarding of a provisional Western Australian operating licence upon deployment. All administrative and statutory assessment fees imposed directly by the TRA remain the exclusive out-of-pocket responsibility of the Candidate.' },
        { type: 'spacer', space: 4 },

        { type: 'header', text: '7. THE CANDIDATE WALLET & SUCCESS-BASED REFUNDS', size: 11, bold: true },
        { type: 'text', text: '7.1 Systematic Recrediting Architecture: To incentivize performance and eliminate structural risk, the Parties agree that upon the Candidate achieving verified passing marks for any individual Ticket module or safety induction, the corresponding personal contribution or advance deposit previously transferred by the Candidate for that specific block shall be automatically re-credited into the Candidate Wallet at a value of one hundred percent (100%).' },
        { type: 'text', text: '7.2 Liquidity and Optionality: The Candidate holds absolute title and ownership over all capital resting within the Candidate Wallet. At their complete, un-fettered discretion, the Candidate may: (a) execute an immediate withdrawal of the liquid funds, or (b) elect to strategically assign the accrued credit balance to offset the remaining candidate liability associated with subsequent Tickets or the pending visa application charge.' },
        { type: 'text', text: '7.3 Forfeiture Exclusions: Wallet balances derived from completed and passed modules remain the un-alienable property of the Candidate and can never be subject to corporate forfeiture, claw-back, or punitive retention, except in the highly specific default conditions explicitly laid out under Clause 9.' },
        { type: 'text', text: '7.4 Governance and Accountability: The Company’s financial compliance division shall maintain precise ledger transparency and shall issue an official itemized balance statement to the Candidate within forty-eight (48) hours of receiving a written request.' },
        { type: 'spacer', space: 4 },

        { type: 'header', text: '8. EXPRESS COVENANTS OF THE COMPANY', size: 11, bold: true },
        { type: 'text', text: 'The Company pledges its corporate infrastructure to the following clear performance parameters:' },
        { type: 'text', text: `8.1 Timely Financial Disbursement: The Company shall systematically advance its required ${companySub} percent (${companySub}%) corporate subsidy to the training infrastructure immediately upon the Candidate fulfilling the corresponding deposit baseline, preventing any artificial processing delays.` },
        { type: 'text', text: '8.2 Absolute Fiscal Transparency: The Company shall furnish comprehensive, itemized written breakdowns of all real course costs, baseline deposit tracking, and SWIFT international bank transfer routing protocols prior to issuing any payment demand to the Candidate.' },
        { type: 'text', text: '8.3 Prompt Interview Execution: The Company shall coordinate and execute the required candidate screening and operational phone interview within seventy-two (72) hours of the Candidate passing their initial online course module.' },
        { type: 'text', text: '8.4 Immigration Processing in Good Faith: The Company shall advance all employer-side sponsorship and nomination petitions through its corporate migration legal team with due diligence, ensuring zero unnecessary lag times, and keeping the Candidate systematically informed of Department of Home Affairs, TRA documentation protocols, and medical milestone pathways.' },
        { type: 'text', text: '8.5 Mobilization Capital Management: The Company shall directly retain, manage, and clear all fiscal outlays required to settle the Candidate’s three-month residential accommodation in Western Australia, matching the parameters defined in Clause 4.4.' },
        { type: 'text', text: '8.6 Strict Compliance Boundaries: The Company formally guarantees that it will never ask for, accept, or process any payment, deduction, or monetary transfer from the Candidate that would violate Australian industrial or migration law. The Company shall directly absorb all sponsorship, nomination, and SAF levy charges as structural overhead costs.' },
        { type: 'spacer', space: 4 },

        { type: 'header', text: '9. EQUITY, MATERIAL VARIATION, & CONTRACT DISSOLUTION', size: 11, bold: true },
        { type: 'text', text: '9.1 Principle of Mutual Commercial Fairness: Both Parties pledge to act with the highest standards of commercial honesty, professional courtesy, and prompt transparency. Consent to vary milestones or adjust operational timeframes shall not be unreasonably withheld where a Party is demonstrably executing their obligations in objective good faith.' },
        { type: 'text', text: '9.2 Academic, Retake, and Fitness Default Framework: If the Candidate experiences a secondary consecutive failure of the same Ticket module, mining induction test, or regulatory driving assessment (meaning they exhaust the maximum allowance of two attempts outlined in Clause 6.6 without securing a pass), or fails to obtain a positive TRA assessment and subsequent OTSR under Clause 6.13, or fails to satisfy the medical, health clearance, or drug screening criteria under Clause 6.10, the Company reserves the absolute right to activate one of the following remedies: (a) permit a final remedial attempt strictly at the Candidate\'s sole separate expense and outside the structural bounds of the company subsidy; (b) reassign the Candidate to an alternative non-trade occupational stream or alternative trainee role better suited to their current capabilities; or (c) instantly terminate this Agreement for material default. Crucially, a partial termination under this sub-clause shall not constitute a generalized breach by the Candidate, and all historical wallet credits accrued via previously passed modules under Clause 7 shall remain fully protected and withdrawable.' },
        { type: 'text', text: '9.3 General Chronological Default: If the absolute aggregate Process is not brought to completion within one (1) calendar month from the Contract Return Date, and the lag cannot be verified as an approved safe-harbour event under Clause 6.12, either Party holds the legal right to dissolve this entire Agreement upon serving five (5) business days of formal written notice to the counter-party.' },
        { type: 'text', text: '9.4 Voluntary Candidate Withdrawal: The Candidate maintains a constant, un-restricted legal right to withdraw from this international recruitment process at any time by serving written notice. Upon voluntary withdrawal, all fully matured balances inside the Candidate Wallet derived from passed courses shall remain entirely payable to the Candidate. Deposits advanced for scheduled course blocks that have not yet been attempted shall be refunded in full, less any objective, non-refundable administrative fees or exam booking charges demonstrably prepaid by the Company to Aveling on the Candidate\'s behalf. The Company must provide a complete itemized receipt of any such deductions upon demand.' },
        { type: 'text', text: '9.5 Corporate Withdrawal and Termination Without Fault: If the Company dissolves this Agreement for reasons completely detached from a verifiable candidate breach (including corporate restructuring, shifting client demands, or macroeconomic market adjustments), the Company shall execute a mandatory, full refund of all cash deposits advanced by the Candidate within fourteen (14) calendar days of contract termination, with zero administrative deductions.' },
        { type: 'text', text: '9.6 Failure to Meet Preliminary Windows: Failure by the Candidate to return the executed agreement within 24 hours, or to provide a valid passport within 3 weeks, empowers the Company to declare this Agreement lapsed without notice and to instantly reallocate the trainee placement to another candidate pool, subject only to a short final written warning window to cure the omission.' },
        { type: 'text', text: '9.7 Absolute Penalty Prohibitions: The Parties explicitly covenant that neither shall seek, enforce, or claim punitive damages, structural exit penalties, or speculative financial compensation against the other. Legal remedies following contract dissolution are strictly bounded to the restitution of actual un-expended capital deposits and the settlement of demonstrable, real-world third-party costs actually incurred. This instrument is not intended to create a punitive exit barrier or a system of debt-bonded employment.' },
        { type: 'spacer', space: 4 },

        { type: 'header', text: '10. DATA PROTECTION & PRIVACY ASSURANCES', size: 11, bold: true },
        { type: 'text', text: 'Each Party shall treat all personal, biographic, financial, and complex medical screening records extracted during the execution of this Agreement with absolute confidentiality. The Company shall implement technical data safeguards to ensure the Candidate’s passport, statutory health profiles, functional evaluation histories, financial accounts, TRA skill validation data, and personal records are accessed, used, and shared solely for the lawful execution of educational enrollments, Department of Home Affairs immigration processing, local transit setup, and client placement verification, in strict compliance with the Privacy Act 1988 (Cth).' },
        { type: 'spacer', space: 4 },

        { type: 'header', text: '11. STRUCTURED DISPUTE RESOLUTION PROTOCOLS', size: 11, bold: true },
        { type: 'text', text: 'In the event of any operational conflict, interpretive disagreement, or financial variance arising from this contract, the Parties shall first seek a resolution through direct, corporate, good-faith executive discussions for a mandatory period of ten (10) business days. If these direct discussions fail to produce a mutually agreeable resolution, the Parties explicitly covenant to submit the dispute to formal mediation before an independent, certified mediator before initiating any hostile litigation or formal judicial proceedings. This clause shall not be interpreted to strip either Party of their underlying statutory rights under Australian Consumer Law or workplace protection codes.' },
        { type: 'spacer', space: 4 },

        { type: 'header', text: '12. GOVERNING JURISDICTION & CHOICE OF LAW', size: 11, bold: true },
        { type: 'text', text: 'This Agreement, its structural validity, and its operational enforcement shall be governed by, interpreted under, and construed in strict accordance with the laws of the State of Western Australia. This choice of law operates without prejudice to any non-excludable statutory protections, minimum workplace standards, or mandatory safety net guarantees natively available to the Candidate under the migration laws, Fair Work Act 2009 (Cth), or equivalent public policy protections of their home sovereign territory.' },
        { type: 'spacer', space: 4 },

        { type: 'header', text: '13. INTEGRATION, SEVERABILITY, & ACKNOWLEDGEMENT', size: 11, bold: true },
        { type: 'text', text: 'This instrument, alongside its appended operational Schedules, constitutes the absolute, entire integrated agreement between the Parties concerning international training, visa and occupational health fitness evaluations, cost-sharing, local driving validation parameters, statutory trade skills recognition infrastructure, and sponsorship mobilization. It completely supersedes and replaces all prior oral discussions, email correspondences, recruitment advertisements, or informal promises. If any individual clause or sub-provision within this contract is declared invalid or legally unenforceable by a court of competent jurisdiction, such invalidity shall not infect the remaining clauses, which shall continue in absolute legal force. The Candidate explicitly acknowledges and affirms that they have read this document in its entirety, fully understand its legal and financial ramifications, and have been afforded an un-restricted opportunity to seek independent legal or immigration advice before executing this contract.' },
        { type: 'spacer', space: 4 },

        { type: 'header', text: '14. STATUTORY SUBMISSION REQUIREMENTS', size: 11, bold: true },
        { type: 'text', text: 'Page 15 (The Execution and Signature Page) must be executed and returned by the Candidate within exactly twenty-four(24) hours of receipt.' },
        { type: 'text', text: 'Page 1 (The Identification Block) must be populated with the Candidate\'s official passport details and certified copy uploads within exactly three (3) weeks of receipt.' },
        { type: 'spacer', space: 6 },
    ];

    contentBlocks.forEach(block => {
        if (block.type === 'header') {
            addText(block.text as string, block.size, block.bold, 14, (block.color as [number, number, number]) || [0, 0, 0]);
        } else if (block.type === 'text') {
            addText(block.text as string, block.size, false, 14, (block.color as [number, number, number]) || [0, 0, 0]);
        } else if (block.type === 'spacer') {
            checkPageBreak(block.space || 2);
            y += (block.space || 2);
        }
    });

    addText('SCHEDULE 1 — ITEMIZED FINANCIAL ARCHITECTURE & APPORTIONMENT BREAKDOWN', 11, true);
    addText('The table below dictates the exact real-world commercial pricing structures for the required core competencies alongside the Subclass 482 Visa parameters and WA regulatory costs.', 9);
    y += 2;

    const s1Rows: string[][] = [];
    let totalCandidateShare = 0;
    let baseIndex = 0;

    // Gap tickets first
    if (tickets && tickets.length > 0) {
        tickets.forEach((ticket: any, index: number) => {
            if (ticket.status === 'not_possessed') {
                const totalCost = parseFloat(ticket.realPrice || ticket.purchasePrice || '0');
                const compAmount = (totalCost * Number(companySub)) / 100;
                const candAmount = totalCost - compAmount;
                totalCandidateShare += candAmount;
                s1Rows.push([
                    `${index + 1}. ${ticket.ticketType}`,
                    `A$${totalCost.toFixed(2)}`,
                    `A$${compAmount.toFixed(2)}`,
                    `A$${candAmount.toFixed(2)}`,
                    'Online/Hybrid. Max 2.'
                ]);
            }
        });
    }

    s1Rows.push(

        [`${tickets.length + 1}. National Police Clearance`, 'A$55.00', 'A$55.00', 'A$0.00', 'Background Check.'],
        [`${tickets.length + 2}. Subclass 482 Visa (VAC Fee)`, 'A$4,015.00', 'A$4,015.00', 'A$0.00', 'Reg 2.87 Compliant.'],
        [`${tickets.length + 3}. TRA Offshore Skills Assessment`, 'Statutory', '100% Company.', 'A$0.00', 'Direct to TRA.'],
        [`${tickets.length + 4}. Mobilization Housing (3 Mo.)`, 'A$12,000.00', 'A$12,000.00', 'A$0.00', 'Company Benefit.']
    );


    checkPageBreak(80);
    autoTable(doc, {
        startY: y,
        head: [['Cost Item / Description', 'Total (AUD)', `Company (${companySub}%)`, `Candidate (${candidateSub}%)`, 'Status / Attempts']],
        body: s1Rows,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 0, 128], textColor: 255 },
    });
    y = (doc as any).lastAutoTable.finalY + 6;

    addText('Official Payment Protocols & Financial Channels:', 10, true);
    addText(`- Commitment Security: The primary initial commitment deposit of A$${audTotal} (${usdtTotal} USDT) must be transferred to the Company's TRC-20 USDT address prior to course portal unlocking.\n- Channel Architecture: All incoming candidate transfers must execute strictly via TRC-20 USDT address issued exclusively within our corporate invoice paperwork. Independent third-party payment platforms or cash handovers are rejected.\n- Settlement Schedule: The foundational ${usdtTotal} USDT deposit is required less than 48 hours post-signing to secure the primary instructional allocations. Partial Payment above 50% of the above stated amount can be made with mandatory completion after 3 tickets.`, 9);
    y += 4;



    y = 15;
    addText('SCHEDULE 2 — STRUCTURAL MILESTONES & EXECUTION DEADLINES', 11, true);

    autoTable(doc, {
        startY: y,
        head: [['Milestone Stage', 'Target Deadline', 'Compliance Path']],
        body: [
            ['Binding Execution', 'Within 24 Hours', 'Return Page 14 to lock placement.'],
            ['Core Commitment Deposit', 'Prior to Portal Booking', `Transfer ${usdtTotal} USDT or partial payment.`],
            ['Passport Submission', 'Within 3 Weeks', 'High-res digital color scan.'],
            ['Aveling Online Exams', 'Within 2 Weeks', 'Done remotely. Max 2 attempts.'],
            ['Arrival & Practical Exams', 'First 7 Days (Arrival)', 'Practical verification in Perth. Max 2 attempts.'],
            ['Driving Readiness (DoT)', 'First 14 Days (Arrival)', 'CTT and PDA completion. Max 2 attempts.'],
            ['Total Mobilization Ready', 'Within 4 Weeks of Return', 'Subject to DHA processing times.']
        ],
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 0, 128], textColor: 255 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    checkPageBreak(50);
    addText('15. CONTRACTUAL EXECUTION & SIGNATURES', 12, true);
    addText(`IN WITNESS WHEREOF, the Parties hereto have caused this Candidate Agreement to be duly executed by their respective authorized signatures, creating a binding, reciprocal legal instrument effective as of ${dateStr}.`);

    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('For Blue Collar Recruitment Pty Limited:', 14, y);
    doc.text(`For the Candidate (${applicant.fullName}):`, 110, y);
    y += 15;
    doc.text('_____________________________________', 14, y);
    doc.text('_____________________________________', 110, y);
    y += 6;
    doc.text('Name: Troy Latuff', 14, y);
    doc.text(`Name: ${applicant.fullName}`, 110, y);
    y += 6;
    doc.text('Position: Chief Executive Officer', 14, y);
    doc.text('Position: Applicant / Candidate', 110, y);
    y += 6;
    doc.text(`Date: ${dateStr}`, 14, y);
    doc.text('Date: ________________________________', 110, y);

    addFooter();
    return doc.output('blob');
}
