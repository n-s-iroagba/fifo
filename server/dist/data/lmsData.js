"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lmsSeedData = void 0;
exports.lmsSeedData = [
    {
        certificationName: 'Working at Heights',
        description: 'Required for any FIFO/mining role operating at heights under Australian WHS Regulations 2022.',
        course: {
            title: 'RIIWHS204E Work safely at heights',
            description: 'Nationally Recognised Unit of Competency RIIWHS204E Work safely at heights under AS/NZS 1891 and WHS Regulations 2022. Covers planning and preparing for working at heights, identifying hazards, selecting and inspecting fall arrest systems, installing anchor points, using ladders and elevated work platforms (EWPs), fitting full body harnesses, and executing emergency rescue response.',
            format: 'Mixed',
            price: 280.00,
            duration: 8,
            capacity: 15,
            modules: [
                {
                    title: 'Module 1: Safety Fundamentals & WHS Compliance',
                    durationMinutes: 15,
                    sequenceOrder: 1,
                    contentType: 'TEXT',
                    contentUrl: 'local-content',
                    content: 'Understand legislative requirements, hazard identification, and risk assessment protocols on FIFO mine sites. You will learn how to read a Safe Work Method Statement (SWMS) and ensure your work area complies with AS/NZS 1891 standards.',
                },
                {
                    title: 'Module 2: Equipment Pre-Inspection & PPE',
                    durationMinutes: 20,
                    sequenceOrder: 2,
                    contentType: 'TEXT',
                    contentUrl: 'local-content',
                    content: 'Learn step-by-step procedures for conducting pre-start equipment checks and harness fitting. This includes checking for frays, inspecting D-rings, and verifying the compliance tags on your shock-absorbing lanyards before stepping foot on site.',
                },
                {
                    title: 'Module 3: Operational Procedures & Rescue',
                    durationMinutes: 25,
                    sequenceOrder: 3,
                    contentType: 'TEXT',
                    contentUrl: 'local-content',
                    content: 'Master safe operation procedures, fall arrest system anchorage, and site emergency evacuation protocols. Crucially, you will understand the timeline required to prevent suspension trauma and the steps to initiate a rapid rescue.',
                }
            ],
            examConfig: {
                passThreshold: 80,
                maxAttempts: 3
            },
            questions: [
                {
                    questionText: 'Under Australian WHS Regulations 2022, when must fall prevention controls be implemented?',
                    questionType: 'mcq',
                    options: [
                        'At any height where there is a risk of a fall causing injury (typically 2 meters or greater in construction/mining)',
                        'Only when working above 5 meters',
                        'Only when working on fragile roofing',
                        'Only when working on scaffolding without guardrails'
                    ],
                    correctOptionIndex: 0,
                    weight: 15
                },
                {
                    questionText: 'According to the Safe Work Australia Code of Practice for Managing the Risk of Falls, what is the highest level of control for height risks?',
                    questionType: 'mcq',
                    options: [
                        'Using a full body harness with shock-absorbing lanyard',
                        'Carrying out work on the ground or on a solid construction (Elimination)',
                        'Installing fall arrest safety nets below the work area',
                        'Posting warning signs and barricades'
                    ],
                    correctOptionIndex: 1,
                    weight: 15
                },
                {
                    questionText: 'Under AS/NZS 1891.4, what is the minimum rated capacity required for a single-person permanent anchor point for fall arrest?',
                    questionType: 'mcq',
                    options: [
                        '5 kN (approx. 500 kg)',
                        '12 kN (approx. 1200 kg)',
                        '15 kN (approx. 1500 kg static load)',
                        '22 kN (approx. 2200 kg)'
                    ],
                    correctOptionIndex: 2,
                    weight: 15
                },
                {
                    questionText: 'Before each use, what tactile and visual inspection must be conducted on fall arrest harnesses and lanyards?',
                    questionType: 'mcq',
                    options: [
                        'Inspect for cuts, fraying, chemical burns, pulling stitching, or deformed D-rings and snaphooks',
                        'Wipe down with industrial degreaser',
                        'Drop test it with a heavy sandbag',
                        'No inspection required if inspected within the past 12 months'
                    ],
                    correctOptionIndex: 0,
                    weight: 15
                },
                {
                    questionText: 'Under AS/NZS 1891, what is the maximum permissible free fall distance when using a standard personal fall arrest lanyard?',
                    questionType: 'mcq',
                    options: [
                        '1.0 meter',
                        '2.0 meters',
                        '3.5 meters',
                        '5.0 meters'
                    ],
                    correctOptionIndex: 1,
                    weight: 10
                },
                {
                    questionText: 'Why is it critical to rapidly rescue a suspended worker within 10 to 15 minutes of a fall arrest event?',
                    questionType: 'mcq',
                    options: [
                        'To prevent suspension trauma (orthostatic intolerance) which can lead to unconsciousness or death from blood pooling',
                        'Because shock absorbing lanyards snap after 15 minutes of suspension',
                        'To avoid site penalty fines from WorkSafe',
                        'Because full body harnesses stretch beyond recovery after 10 minutes'
                    ],
                    correctOptionIndex: 0,
                    weight: 15
                },
                {
                    questionText: 'When setting up a single extension ladder, what is the correct slope ratio under Australian Standards?',
                    questionType: 'mcq',
                    options: [
                        '1:1 (45 degrees)',
                        '4:1 (75 degrees - 1 meter out from the wall for every 4 meters of vertical rise)',
                        '2:1 (60 degrees)',
                        '8:1 (82 degrees)'
                    ],
                    correctOptionIndex: 1,
                    weight: 15
                }
            ],
            practicalCriteria: [
                'Conduct hazard identification and risk assessment (SWMS / JSA) for height tasks',
                'Perform pre-use tactile and visual inspection of full body harness, lanyard, and energy absorber',
                'Correctly fit, adjust, and perform 2-finger check on full body harness',
                'Identify and verify rated anchor point (15kN) and attach lanyard safely',
                'Demonstrate 100% tie-off technique using dual lanyards during lateral transition',
                'Demonstrate correct deployment and operation of portable ladder with 3 points of contact',
                'Demonstrate emergency rescue response and deployment of suspension trauma relief straps'
            ]
        }
    },
    {
        certificationName: 'Confined Space Entry',
        description: 'Required for roles that involve entering or working in confined spaces.',
        course: {
            title: 'RIIWHS202E Enter and work in confined spaces',
            description: 'Learn how to safely enter and work in confined spaces in various industries.',
            format: 'Mixed',
            price: 350.00,
            duration: 8,
            capacity: 12,
            examConfig: {
                passThreshold: 80,
                maxAttempts: 3
            },
            questions: [
                {
                    questionText: 'Which of the following is considered a confined space?',
                    questionType: 'mcq',
                    options: ['An open-cut mine', 'A well-ventilated warehouse', 'A storage tank or silo', 'An office building'],
                    correctOptionIndex: 2, // 'A storage tank or silo'
                    weight: 10
                },
                {
                    questionText: 'Who must remain outside a confined space to monitor the workers inside?',
                    questionType: 'mcq',
                    options: ['The Site Manager', 'A Standby Person (Hole Watch)', 'The First Aid Officer', 'Nobody is required'],
                    correctOptionIndex: 1, // 'A Standby Person (Hole Watch)'
                    weight: 10
                }
            ],
            practicalCriteria: [
                'Identifies hazards associated with confined spaces',
                'Properly uses atmospheric testing equipment',
                'Demonstrates correct entry and exit procedures',
                'Communicates effectively with standby person'
            ]
        }
    },
    {
        certificationName: 'First Aid & CPR',
        description: 'Basic medical response required for many site roles.',
        course: {
            title: 'HLTAID011 Provide First Aid',
            description: 'Comprehensive first aid training for remote sites.',
            format: 'Theory',
            price: 150.00,
            duration: 4,
            capacity: 20,
            examConfig: {
                passThreshold: 100,
                maxAttempts: 5
            },
            questions: [
                {
                    questionText: 'What is the correct ratio of chest compressions to rescue breaths in CPR?',
                    questionType: 'mcq',
                    options: ['15:2', '30:2', '10:1', '5:1'],
                    correctOptionIndex: 1, // '30:2'
                    weight: 10
                }
            ],
            practicalCriteria: []
        }
    },
    {
        certificationName: 'White Card',
        description: 'Mandatory General Construction Induction certification required before entering any Australian construction or FIFO resource work site under WHS Regulations 2022.',
        course: {
            title: 'CPCWHS1001 Prepare to work safely in the construction industry',
            description: 'Nationally Recognised Unit of Competency CPCWHS1001 Prepare to work safely in the construction industry (General Construction Induction Card / White Card). Covers health and safety legislative requirements, basic risk management principles, duty of care under WHS Act 2011, hazard identification, Safe Work Method Statements (SWMS), incident reporting, safety sign comprehension, personal protective equipment (PPE) selection and inspection, and emergency evacuation procedures.',
            format: 'Mixed',
            price: 120.00,
            duration: 6,
            capacity: 25,
            examConfig: {
                passThreshold: 100,
                maxAttempts: 5
            },
            questions: [
                {
                    questionText: 'Under the Work Health and Safety (WHS) Act 2011, who has the primary duty of care to ensure, so far as is reasonably practicable, the health and safety of workers?',
                    questionType: 'mcq',
                    options: [
                        'The Person Conducting a Business or Undertaking (PCBU / Employer)',
                        'The local police department',
                        'Individual sub-contractors on an individual basis only',
                        'The safety equipment supplier'
                    ],
                    correctOptionIndex: 0,
                    weight: 15
                },
                {
                    questionText: 'What document MUST be prepared before performing any high-risk construction work (e.g., risk of fall >2m, demolition, trenching)?',
                    questionType: 'mcq',
                    options: [
                        'Safe Work Method Statement (SWMS)',
                        'Standard Operating Invoice',
                        'Annual Tax Declaration',
                        'Purchase Order Clearance'
                    ],
                    correctOptionIndex: 0,
                    weight: 15
                },
                {
                    questionText: 'Which level of the Hierarchy of Risk Control is considered the MOST effective way to protect workers?',
                    questionType: 'mcq',
                    options: [
                        'Elimination (completely removing the hazard)',
                        'Personal Protective Equipment (PPE)',
                        'Administrative controls (warning signs)',
                        'Engineering controls (guard rails)'
                    ],
                    correctOptionIndex: 0,
                    weight: 15
                },
                {
                    questionText: 'What color and shape signifies a DANGER sign on an Australian construction site (e.g. Danger High Voltage)?',
                    questionType: 'mcq',
                    options: [
                        'Red oval inside a black rectangle with the word DANGER in white text',
                        'Green circle with white lettering',
                        'Blue triangle with black border',
                        'Yellow square with black dots'
                    ],
                    correctOptionIndex: 0,
                    weight: 10
                },
                {
                    questionText: 'If a worker discovers damaged or faulty personal protective equipment (e.g. cracked hard hat or torn harness), what is the correct action under WHS regulations?',
                    questionType: 'mcq',
                    options: [
                        'Immediately tag it out of service, report it to the site supervisor, and replace it',
                        'Continue using it until the end of the shift',
                        'Pass it on to a junior co-worker',
                        'Tape it up with duct tape and keep working'
                    ],
                    correctOptionIndex: 0,
                    weight: 15
                },
                {
                    questionText: 'Which four pieces of Personal Protective Equipment (PPE) are mandatory basic requirements on almost all Australian construction sites?',
                    questionType: 'mcq',
                    options: [
                        'Hard hat, High-visibility vest/shirt, Steel-cap boots, Eye protection (Safety glasses)',
                        'Sun hat, Flip flops, T-shirt, Shorts',
                        'Leather apron, Welding mask, Rubber boots, Gloves',
                        'Dust mask, Ear muffs, Rain jacket, Sandals'
                    ],
                    correctOptionIndex: 0,
                    weight: 15
                },
                {
                    questionText: 'What must a worker do IMMEDIATELY if an uncontrolled emergency or fire occurs on site?',
                    questionType: 'mcq',
                    options: [
                        'Raise the alarm, notify supervisor, evacuate via safe routes to designated emergency assembly point',
                        'Finish current task before leaving',
                        'Call site HR department to request leave',
                        'Hide in the nearest portaloo'
                    ],
                    correctOptionIndex: 0,
                    weight: 15
                }
            ],
            practicalCriteria: [
                'Demonstrate correct fitting and pre-use inspection of 4 mandatory PPE items (Hard hat, High-Vis, Safety Glasses, Hearing Protection)',
                'Identify 3 site hazard signs (Danger, Mandatory, Emergency Warning) and explain required actions',
                'Demonstrate verbal hazard notification and completion of a site Incident/Hazard Report form',
                'Demonstrate emergency evacuation path identification and assembly point procedure'
            ]
        }
    }
];
