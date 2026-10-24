/**
 * Helper to ensure each ticket course has 35 comprehensive multiple-choice examination questions
 * adhering to WA Mines Safety and Inspection Act, Work Health and Safety (Mines) Regulations,
 * and CertHero RTO accredited unit standards.
 */

export interface QuestionData {
    questionText: string;
    questionType: string;
    options: string[];
    correctOptionIndex: number;
    weight: number;
}

export function ensure35Questions(baseQuestions: QuestionData[], courseTitle: string, unitCode: string): QuestionData[] {
    const questions: QuestionData[] = [...baseQuestions];
    let counter = questions.length + 1;

    // Realistic WA mining questions generator for compliance and technical proficiency
    const supplementaryTemplates = [
        {
            text: `Under Western Australian Work Health and Safety (Mines) Regulations, what is the primary duty of care when performing activities under ${unitCode}?`,
            options: [
                'Ensure all hazards are identified, assessed, and controlled to reduce risk so far as is reasonably practicable.',
                'Prioritize production output over secondary safety sign-offs when running on schedule.',
                'Rely solely on verbal instructions without written Job Safety Analysis (JSA) or Take 5 sign-offs.',
                'Delegate all pre-operational safety inspections exclusively to the site superintendent.'
            ],
            correct: 0
        },
        {
            text: `What mandatory personal protective equipment (PPE) must be inspected and worn prior to initiating tasks under ${unitCode} on an active WA mine site?`,
            options: [
                'Standard street clothing and non-steel-capped canvas shoes.',
                'High-visibility reflective long-sleeve apparel, steel-cap boots, hard hat, safety glasses, and task-specific gloves.',
                'Only safety glasses if working during daylight hours.',
                'Ear protection only, with hard hats being optional inside designated open pits.'
            ],
            correct: 1
        },
        {
            text: `When conducting a dynamic hazard assessment (Take 5 / JSA) for ${unitCode}, what is the first step according to the Hierarchy of Controls?`,
            options: [
                'Implement Personal Protective Equipment (PPE).',
                'Introduce administrative signage and warning tags.',
                'Attempt to eliminate the hazard entirely at its source.',
                'Substitute the equipment with a slightly newer model without testing.'
            ],
            correct: 2
        },
        {
            text: `If a defect or structural damage is observed during a pre-operational walkaround under ${unitCode}, what immediate action is required?`,
            options: [
                'Operate the equipment cautiously and report the defect at the conclusion of the 12-hour shift.',
                'Immediately tag out the equipment (Out of Service / Danger Tag), isolate from energy sources, and log in site maintenance records.',
                'Attempt temporary repairs using non-certified cables or tape before commencing shift work.',
                'Pass the equipment to the next shift without documenting to avoid production downtime.'
            ],
            correct: 1
        },
        {
            text: `What is the protocol if an unplanned emergency evacuation siren is sounded while engaged in operations governed by ${unitCode}?`,
            options: [
                'Continue working until a direct supervisor physically arrives to escort personnel.',
                'Immediately make the work area and machinery safe, isolate if safe to do so, and proceed directly to the designated muster point.',
                'Remain inside the cab or work area with doors closed until communications are re-established.',
                'Drive private vehicles immediately toward the airstrip or exit gates.'
            ],
            correct: 1
        },
        {
            text: `How frequently must pre-start equipment checklists be completed under ${unitCode} standards on high-risk resource operations?`,
            options: [
                'Prior to every work shift or change of operator before equipment is engaged.',
                'Once per weekly maintenance cycle by the mechanical supervisor.',
                'Only after an equipment warning light or alarm illuminates during operation.',
                'Monthly, during general site environmental audits.'
            ],
            correct: 0
        },
        {
            text: `Under Western Australian mining legislation, what legal obligation exists regarding reporting near-miss incidents under ${unitCode}?`,
            options: [
                'Near-misses do not require reporting unless physical property damage exceeds $50,000.',
                'All near-misses must be formally reported to site management to investigate root causes and prevent catastrophic recurrences.',
                'Reporting is strictly voluntary and decided by the contractor team leader.',
                'Only near-misses involving airborne objects require documentation.'
            ],
            correct: 1
        },
        {
            text: `What isolation procedure must be verified before performing maintenance or inspection on energized or hydraulic systems in ${unitCode}?`,
            options: [
                'Verbal confirmation from an adjacent operator.',
                'Lockout / Tagout (LOTO) isolation, dissipation of stored hydraulic or electrical energy, and verification of zero energy state.',
                'Simply switching off the main ignition key while leaving battery isolators engaged.',
                'Placing a warning cone behind the rear axle.'
            ],
            correct: 1
        },
        {
            text: `In the event of environmental spillage (oil, fuel, chemical) during operations associated with ${unitCode}, what immediate response is mandated?`,
            options: [
                'Wash the spillage into drainage channels using high-pressure water hoses.',
                'Deploy site spill containment kits, contain the spread, prevent ingress to watercourses, and report to the environmental supervisor.',
                'Cover the spillage with loose dry dirt and continue standard production.',
                'Ignore minor spills under 100 litres.'
            ],
            correct: 1
        },
        {
            text: `What fatigue management regulation applies to 12-hour FIFO rosters operating under ${unitCode} in remote WA sites?`,
            options: [
                'Personnel may work unlimited consecutive shifts without mandatory rest periods if paid double-time.',
                'Mandatory minimum continuous rest breaks between shifts, hydration monitoring, and immediate self-reporting of impairment or extreme fatigue.',
                'Operators may consume energy supplements to bypass statutory rest requirements.',
                'Rest breaks are determined solely by production quota completion.'
            ],
            correct: 1
        },
        {
            text: `Which communication standard is mandatory during heavy equipment interaction or high-risk tasks under ${unitCode}?`,
            options: [
                'Hand gestures only, without standard two-way radio channels.',
                'Dedicated two-way radio call-and-acknowledge protocols using standard positive communication standards.',
                'Mobile telephone text messages while operating machinery.',
                'Sounding the horn repeatedly without verbal verification.'
            ],
            correct: 1
        },
        {
            text: `What is the significance of the manufacturer's operational manual when configuring operating parameters under ${unitCode}?`,
            options: [
                'It is an advisory document that site personnel may disregard based on operational urgency.',
                'It defines the mandatory legal limits, load capacities, and safe operational parameters that cannot be exceeded.',
                'It applies only during the factory commissioning phase.',
                'It is replaced entirely by informal verbal instructions from senior co-workers.'
            ],
            correct: 1
        },
        {
            text: `Under ${unitCode}, what action must be taken if atmospheric or weather conditions (such as severe lightning, cyclonic winds, or extreme dust) exceed safe limits?`,
            options: [
                'Suspend operations immediately, secure equipment, notify supervision, and seek shelter in designated safe structures.',
                'Increase operational speed to complete the shift before conditions worsen.',
                'Turn off cab air-conditioning and continue work.',
                'Relocate equipment to the lowest point of the open pit without advising dispatch.'
            ],
            correct: 0
        },
        {
            text: `What documentation must an operator carry or have verified on site before operating machinery or performing duties under ${unitCode}?`,
            options: [
                'Proof of national identity only.',
                'Current High Risk Work Licence (HRWL) or Statement of Attainment and site-specific Verification of Competency (VOC).',
                'A verbal letter of introduction from an overseas trade guild.',
                'No documentation is needed once initial site access gate pass is issued.'
            ],
            correct: 1
        },
        {
            text: `When working in proximity to high-voltage overhead powerlines during tasks under ${unitCode}, what distance standard applies?`,
            options: [
                'Maintain statutory exclusion zones and safe approach distances, utilizing spotters and physical barriers as specified in AS 3007.',
                'Personnel may approach within 1 metre provided rubber-soled footwear is worn.',
                'Exclusion zones only apply in wet weather.',
                'Powerline clearance is measured by visual estimate from the operator cab without formal measurement.'
            ],
            correct: 0
        },
        {
            text: `What is the correct protocol for manual handling and ergonomic safety when lifting components or tools under ${unitCode}?`,
            options: [
                'Bend at the waist and use back muscles to lift heavy components quickly.',
                'Assess load weight, use mechanical lifting aids where feasible, maintain neutral spine, and engage team lifting for loads exceeding 20kg.',
                'Always lift single-handedly to maintain balance.',
                'Twist the torso while lifting heavy objects to transfer momentum.'
            ],
            correct: 1
        },
        {
            text: `What standard of housekeeping is required in work areas and accessways under ${unitCode}?`,
            options: [
                'Keep all walkways, stairs, and work surfaces clear of tools, grease, debris, and trip hazards at all times.',
                'Housekeeping is performed only at end-of-month audits.',
                'Store spare parts and empty drums in high-traffic stairwells for easy accessibility.',
                'Housekeeping is solely the responsibility of third-party cleaning contractors.'
            ],
            correct: 0
        },
        {
            text: `What is the purpose of a Permit to Work (PTW) system as utilized in ${unitCode}?`,
            options: [
                'A financial accounting voucher for equipment hire.',
                'A formalized safety control mechanism authorizing specific high-risk tasks under controlled, documented conditions.',
                'A visa extension document for overseas personnel.',
                'A replacement for daily pre-start inspections.'
            ],
            correct: 1
        },
        {
            text: `If an operator feels uncertain about the safety of an assigned task under ${unitCode}, what statutory right does the worker hold?`,
            options: [
                'The worker must execute the task regardless to avoid disciplinary action.',
                'The right to cease or refuse unsafe work immediately without penalty, report concerns, and participate in resolution.',
                'The worker may leave the mine site permanently without notifying management.',
                'The worker must pay another employee to execute the hazardous task.'
            ],
            correct: 1
        },
        {
            text: `What is the proper method to verify that an equipment safety interlock is functioning correctly under ${unitCode}?`,
            options: [
                'Bypass the interlock with wire to test whether the machine continues to operate.',
                'Conduct systematic functional testing strictly according to the OEM commissioning procedure prior to operation.',
                'Assume the interlock is working if the machine starts up without error lights.',
                'Interlocks do not require verification on modern digital machinery.'
            ],
            correct: 1
        },
        {
            text: `What role does emergency eyewash and safety shower equipment play in operational areas governed by ${unitCode}?`,
            options: [
                'Drinking water supply in case of dehydration.',
                'Immediate decontamination of chemical or particulate exposure to eyes and skin, requiring monthly functional inspection.',
                'Routine hand-washing before meal breaks.',
                'Decorative safety compliance fixtures.'
            ],
            correct: 1
        },
        {
            text: `What is the standard procedure for hot work (welding, cutting, grinding) in proximity to flammable materials under ${unitCode}?`,
            options: [
                'Obtain an authorized Hot Work Permit, clear combustibles within 15m, provide calibrated fire extinguishers, and maintain fire-watch.',
                'Perform hot work quickly without permits if working outdoors.',
                'Wet down combustible materials with solvent before commencing grinding.',
                'A fire watch is only required if flames are actively visible.'
            ],
            correct: 0
        },
        {
            text: `How must hazardous chemicals and lubricants used in conjunction with ${unitCode} be stored on site?`,
            options: [
                'In unlabelled containers near open drainage ditches.',
                'In compliant, bunded chemical storage areas with Safety Data Sheets (SDS) readily accessible and up to date.',
                'In standard cardboard boxes in direct sunlight.',
                'Anywhere in the workshop provided lids are loosely placed.'
            ],
            correct: 1
        },
        {
            text: `What is the function of an Emergency Stop (E-Stop) device on machinery operating under ${unitCode}?`,
            options: [
                'Standard operational parking brake used at the end of each shift.',
                'Rapid, failsafe emergency de-energization to bring equipment to a safe halt in imminent danger situations.',
                'To reset digital instrumentation screens.',
                'A power-saving feature used during lunch breaks.'
            ],
            correct: 1
        },
        {
            text: `Under Western Australian mining standards, what is the policy regarding drug and alcohol impairment on site under ${unitCode}?`,
            options: [
                'Zero tolerance (0.00% BAC) with mandatory random, blanket, and reasonable-cause testing protocols.',
                'Up to 0.05% BAC is permissible if operating stationary plant.',
                'Testing only occurs following an incident causing hospital admission.',
                'Alcohol consumption is permitted during off-duty camp rest hours regardless of shift schedule.'
            ],
            correct: 0
        }
    ];

    while (questions.length < 35) {
        const t = supplementaryTemplates[(counter - 1) % supplementaryTemplates.length];
        questions.push({
            questionText: `[Q${counter}] ${t.text}`,
            questionType: 'mcq',
            options: t.options,
            correctOptionIndex: t.correct,
            weight: 3
        });
        counter++;
    }

    return questions;
}
