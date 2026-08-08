export const lmsSeedData = [
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
    }
];
