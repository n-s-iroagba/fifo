export const lmsSeedData = [
    {
        certificationName: 'Working at Heights',
        description: 'Required for any role operating at heights above 2 meters.',
        course: {
            title: 'RIIWHS204E Work safely at heights',
            description: 'This course provides the skills and knowledge required to work safely at heights in the resources and infrastructure industries.',
            format: 'Mixed',
            price: 250.00,
            duration: 8,
            capacity: 15,
            examConfig: {
                passThreshold: 80,
                maxAttempts: 3
            },
            questions: [
                {
                    questionText: 'What is the minimum height at which fall prevention measures are generally required?',
                    questionType: 'multiple_choice',
                    options: JSON.stringify(['1 meter', '2 meters', '3 meters', '4 meters']),
                    correctAnswer: '2 meters',
                    weighting: 1
                },
                {
                    questionText: 'Before using a safety harness, you should always:',
                    questionType: 'multiple_choice',
                    options: JSON.stringify(['Inspect it for damage', 'Wash it in warm water', 'Leave it in direct sunlight', 'Adjust it loosely']),
                    correctAnswer: 'Inspect it for damage',
                    weighting: 1
                }
            ],
            practicalCriteria: [
                'Correctly selects and inspects fall arrest equipment',
                'Properly fits and adjusts full-body harness',
                'Demonstrates safe attachment to anchor points',
                'Maintains 100% tie-off during transition'
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
                    questionType: 'multiple_choice',
                    options: JSON.stringify(['An open-cut mine', 'A well-ventilated warehouse', 'A storage tank or silo', 'An office building']),
                    correctAnswer: 'A storage tank or silo',
                    weighting: 1
                },
                {
                    questionText: 'Who must remain outside a confined space to monitor the workers inside?',
                    questionType: 'multiple_choice',
                    options: JSON.stringify(['The Site Manager', 'A Standby Person (Hole Watch)', 'The First Aid Officer', 'Nobody is required']),
                    correctAnswer: 'A Standby Person (Hole Watch)',
                    weighting: 1
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
                    questionType: 'multiple_choice',
                    options: JSON.stringify(['15:2', '30:2', '10:1', '5:1']),
                    correctAnswer: '30:2',
                    weighting: 1
                }
            ],
            practicalCriteria: []
        }
    }
];
