export const lmsSeedData = [
    {
        certificationName: 'EEHA Certification',
        description: 'Electrical Equipment in Hazardous Areas (EEHA) advanced trade prerequisite for hazardous mining and energy environments.',
        course: {
            title: 'UEERL0004 Conduct testing and maintenance of electrical equipment in hazardous areas',
            description: 'Advanced trade qualification covering electrical protection principles, explosive gas/dust atmosphere classification, flameproof (Ex d), increased safety (Ex e), intrinsic safety (Ex i), encapsulation (Ex m), purge/pressurization (Ex p), visual and detailed inspections under AS/NZS 60079 series, and maintenance logging for WA resource sites.',
            format: 'Mixed',
            price: 1850.00,
            duration: 40,
            capacity: 10,
            modules: [
                {
                    title: 'Module 1: Explosive Atmospheres & Zone Classifications',
                    durationMinutes: 45,
                    sequenceOrder: 1,
                    contentType: 'TEXT',
                    contentUrl: 'local-content',
                    content: 'Study AS/NZS 60079.10 standards, defining Zone 0, Zone 1, Zone 2 for gas hazards, and Zone 20, Zone 21, Zone 22 for combustible dusts. Understand temperature classes (T1-T6) and gas groups (I, IIA, IIB, IIC).',
                },
                {
                    title: 'Module 2: Explosion Protection Techniques (Ex d, Ex e, Ex i, Ex p)',
                    durationMinutes: 60,
                    sequenceOrder: 2,
                    contentType: 'TEXT',
                    contentUrl: 'local-content',
                    content: 'Detailed breakdown of flameproof enclosures (Ex d) flamepaths and gap clearances, increased safety (Ex e) terminal creepage/clearance, intrinsically safe barriers (Ex i) entity parameters (Ui, Ii, Pi vs Uo, Io, Po), and pressurized enclosures (Ex p).',
                },
                {
                    title: 'Module 3: Inspection Protocols, Testing & Compliance Verification',
                    durationMinutes: 60,
                    sequenceOrder: 3,
                    contentType: 'TEXT',
                    contentUrl: 'local-content',
                    content: 'Visual, close, and detailed inspection procedures under AS/NZS 60079.17. IP rating verification, cable gland barrier fittings (Ex d glands), earth bonding integrity, and maintaining the Hazardous Area Verification Dossier (HAVD).',
                }
            ],
            examConfig: {
                passThreshold: 80,
                maxAttempts: 2
            },
            questions: [
                {
                    questionText: 'Under AS/NZS 60079.10.1, how is Zone 1 defined in a gas explosive atmosphere?',
                    questionType: 'mcq',
                    options: [
                        'An area in which an explosive gas atmosphere is likely to occur periodically or occasionally in normal operation',
                        'An area in which an explosive gas atmosphere is present continuously or for long periods',
                        'An area in which an explosive gas atmosphere is not likely to occur in normal operation and if it occurs will exist for a short period only',
                        'An underground coal mine shaft only'
                    ],
                    correctOptionIndex: 0,
                    weight: 20
                },
                {
                    questionText: 'What is the primary operational mechanism of Flameproof (Ex d) electrical protection?',
                    questionType: 'mcq',
                    options: [
                        'It withstands an internal explosion and prevents the transmission of flame to the surrounding explosive atmosphere via flamepaths',
                        'It completely prevents electrical sparks from occurring inside the enclosure',
                        'It limits electrical energy so sparks cannot ignite gas',
                        'It maintains positive air pressure to keep gases out'
                    ],
                    correctOptionIndex: 0,
                    weight: 20
                },
                {
                    questionText: 'For Intrinsically Safe (Ex i) circuits, which entity parameter relationship MUST be satisfied for safety compliance?',
                    questionType: 'mcq',
                    options: [
                        'Ui >= Uo, Ii >= Io, Pi >= Po (Safety barrier maximum output must not exceed apparatus maximum input ratings)',
                        'Ui <= Uo, Ii <= Io',
                        'Ui = 0V always',
                        'No matching parameters are required'
                    ],
                    correctOptionIndex: 0,
                    weight: 20
                },
                {
                    questionText: 'Under AS/NZS 60079.17, what distinguishes a Detailed Inspection from a Close Inspection?',
                    questionType: 'mcq',
                    options: [
                        'A Detailed inspection requires opening enclosures and using tools/feelers to check internal components and flamepath gaps',
                        'A Detailed inspection is done using binoculars from a distance',
                        'A Close inspection requires dismantling all conduit pipes',
                        'There is no difference between close and detailed inspections'
                    ],
                    correctOptionIndex: 0,
                    weight: 20
                },
                {
                    questionText: 'What temperature class (T-Class) represents the lowest maximum surface temperature limit (450°C vs 85°C)?',
                    questionType: 'mcq',
                    options: [
                        'T6 (85°C)',
                        'T1 (450°C)',
                        'T3 (200°C)',
                        'T4 (135°C)'
                    ],
                    correctOptionIndex: 0,
                    weight: 20
                }
            ],
            practicalCriteria: [
                'Perform a pre-inspection review of Hazardous Area Verification Dossier (HAVD) drawings and certifications',
                'Demonstrate measurement and clearance check of Ex d flamepath gaps using feeler gauges',
                'Select and correctly fit Ex d barrier cable gland to armored cable',
                'Conduct a detailed inspection on Ex e terminal box checking IP seal and earth continuity',
                'Verify intrinsic safety circuit barrier isolation and entity parameter match'
            ]
        }
    },
    {
        certificationName: 'Standard 11 Mining Induction',
        description: 'Mandatory core surface site safety induction for Western Australia and Queensland mining environments.',
        course: {
            title: 'STD11 Standard 11 Surface Mining Safety Induction',
            description: 'Recognized surface mining safety induction program covering hazard identification, risk management (SLAM/Take 5), personal safety equipment, isolation and tagging (Out of Service / Personal Isolation), emergency response, fire safety, and environmental awareness on resource sites.',
            format: 'Mixed',
            price: 690.00,
            duration: 16,
            capacity: 15,
            modules: [
                {
                    title: 'Module 1: Mine Legislation & Site Safety Culture',
                    durationMinutes: 30,
                    sequenceOrder: 1,
                    contentType: 'TEXT',
                    contentUrl: 'local-content',
                    content: 'Learn WHS (Mines) legislation, duty of care for workers and site operators, obligation to follow safety procedures, and the culture of zero harm on FIFO mine sites.',
                },
                {
                    title: 'Module 2: Risk Assessment & Hazard Controls (Take 5 / JHA)',
                    durationMinutes: 45,
                    sequenceOrder: 2,
                    contentType: 'TEXT',
                    contentUrl: 'local-content',
                    content: 'Master hazard identification techniques including Take 5 assessments, Job Hazard Analysis (JHA), and applying the Hierarchy of Controls to site tasks.',
                },
                {
                    title: 'Module 3: Isolation, Lockout & Tagging (LOTO)',
                    durationMinutes: 45,
                    sequenceOrder: 3,
                    contentType: 'TEXT',
                    contentUrl: 'local-content',
                    content: 'Understand personal locks, isolation locks, Out of Service tags, Danger tags, zero energy state verification, and group isolation procedures.',
                }
            ],
            examConfig: {
                passThreshold: 80,
                maxAttempts: 2
            },
            questions: [
                {
                    questionText: 'What is the primary purpose of a Yellow/Black Out of Service Tag on a mine site?',
                    questionType: 'mcq',
                    options: [
                        'To indicate that equipment or machinery is unsafe or damaged and must not be operated',
                        'To reserve the machine for a specific operator shift',
                        'To indicate that routine servicing is completed',
                        'To mark equipment for relocation to another mine site'
                    ],
                    correctOptionIndex: 0,
                    weight: 25
                },
                {
                    questionText: 'When performing a personal isolation under mine LOTO rules, what MUST be done after applying your lock and tag?',
                    questionType: 'mcq',
                    options: [
                        'Test and verify zero energy state (try to start/energize equipment locally before commencing work)',
                        'Immediately begin work without testing',
                        'Hand your key to the site supervisor',
                        'Leave the area unattended for 30 minutes'
                    ],
                    correctOptionIndex: 0,
                    weight: 25
                },
                {
                    questionText: 'In the Hierarchy of Risk Control, where does Personal Protective Equipment (PPE) sit?',
                    questionType: 'mcq',
                    options: [
                        'As the last line of defense (lowest level of control)',
                        'As the primary and most effective control measure',
                        'Above Elimination and Substitution',
                        'It is not recognized as a control measure'
                    ],
                    correctOptionIndex: 0,
                    weight: 25
                },
                {
                    questionText: 'What step should a worker take if they identify an uncontrolled critical hazard on a haul road or processing plant?',
                    questionType: 'mcq',
                    options: [
                        'Stop work immediately, isolate/barricade the area if safe to do so, and notify site radio dispatch/supervisor',
                        'Ignore it if it is outside your assigned work area',
                        'Wait until shift handover to mention it',
                        'Post a photo on social media'
                    ],
                    correctOptionIndex: 0,
                    weight: 25
                }
            ],
            practicalCriteria: [
                'Complete a site Take 5 / JHA risk assessment for a simulated mine site task',
                'Demonstrate correct application of personal isolation lock and Red Danger Tag on an isolation point',
                'Perform zero energy verification (test for dead / try-start)',
                'Demonstrate correct selection and fitting of site PPE including high-vis, safety glasses, hard hat, and boots',
                'Demonstrate radio communications protocol on a simulated site channel'
            ]
        }
    },
    {
        certificationName: 'White Card WA',
        description: 'Mandatory General Construction Induction certification required before entering any Australian construction or FIFO resource work site under WHS Regulations 2022.',
        course: {
            title: 'CPCWHS1001 Prepare to work safely in the construction industry',
            description: 'Nationally Recognised Unit of Competency CPCWHS1001 Prepare to work safely in the construction industry (General Construction Induction Card / White Card). Covers health and safety legislative requirements, basic risk management principles, duty of care under WHS Act 2011, hazard identification, Safe Work Method Statements (SWMS), incident reporting, safety sign comprehension, personal protective equipment (PPE) selection and inspection, and emergency evacuation procedures.',
            format: 'Mixed',
            price: 95.00,
            duration: 6,
            capacity: 25,
            examConfig: {
                passThreshold: 100,
                maxAttempts: 2
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
                    weight: 15
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
                    weight: 10
                }
            ],
            practicalCriteria: [
                'Demonstrate correct fitting and pre-use inspection of 4 mandatory PPE items (Hard hat, High-Vis, Safety Glasses, Hearing Protection)',
                'Identify 3 site hazard signs (Danger, Mandatory, Emergency Warning) and explain required actions',
                'Demonstrate verbal hazard notification and completion of a site Incident/Hazard Report form',
                'Demonstrate emergency evacuation path identification and assembly point procedure'
            ]
        }
    },
    {
        certificationName: 'Working at Heights',
        description: 'Required for any FIFO/mining role operating at heights under Australian WHS Regulations 2022.',
        course: {
            title: 'RIIWHS204E Work safely at heights',
            description: 'Nationally Recognised Unit of Competency RIIWHS204E Work safely at heights under AS/NZS 1891 and WHS Regulations 2022. Covers planning and preparing for working at heights, identifying hazards, selecting and inspecting fall arrest systems, installing anchor points, using ladders and elevated work platforms (EWPs), fitting full body harnesses, and executing emergency rescue response.',
            format: 'Mixed',
            price: 270.00,
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
                maxAttempts: 2
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
        description: 'Required for roles that involve entering or working in confined spaces under AS 2865.',
        course: {
            title: 'RIIWHS202E Enter and work in confined spaces',
            description: 'Nationally Recognised Unit of Competency RIIWHS202E Enter and work in confined spaces under AS 2865. Covers identifying confined spaces, atmospheric testing, isolation and lockout, standby observer (hole watch) duties, entry permits, and emergency retrieval.',
            format: 'Mixed',
            price: 290.00,
            duration: 8,
            capacity: 12,
            modules: [
                {
                    title: 'Module 1: Confined Space Identification & Regulations',
                    durationMinutes: 20,
                    sequenceOrder: 1,
                    contentType: 'TEXT',
                    contentUrl: 'local-content',
                    content: 'Understand AS 2865 criteria defining a confined space: enclosed/partially enclosed space, not intended for human occupancy, restricted entry/exit, hazardous atmosphere or engulfment risk.',
                },
                {
                    title: 'Module 2: Gas Monitoring & Entry Permits',
                    durationMinutes: 30,
                    sequenceOrder: 2,
                    contentType: 'TEXT',
                    contentUrl: 'local-content',
                    content: 'Learn gas detector calibration, sampling at multiple levels (top, middle, bottom), oxygen range requirements (19.5% - 23.5%), LEL limits, and valid entry permit authorizations.',
                },
                {
                    title: 'Module 3: Standby Observer Duties & Emergency Protocols',
                    durationMinutes: 30,
                    sequenceOrder: 3,
                    contentType: 'TEXT',
                    contentUrl: 'local-content',
                    content: 'Role of the Hole Watch / Standby Person: continuous communication, monitoring entrant log, never entering the space during emergency, initiating tripod/winch retrieval.',
                }
            ],
            examConfig: {
                passThreshold: 80,
                maxAttempts: 2
            },
            questions: [
                {
                    questionText: 'Under AS 2865, what is the acceptable safe concentration range of oxygen for confined space entry without breathing apparatus?',
                    questionType: 'mcq',
                    options: [
                        '19.5% to 23.5% by volume',
                        '15% to 20% by volume',
                        '25% to 30% by volume',
                        '100% pure oxygen'
                    ],
                    correctOptionIndex: 0,
                    weight: 25
                },
                {
                    questionText: 'Which of the following is considered a primary duty of the Standby Person (Hole Watch)?',
                    questionType: 'mcq',
                    options: [
                        'Maintain continuous communication with entrants and NEVER enter the confined space during an emergency',
                        'Enter the space to assist workers if they feel tired',
                        'Leave the entry point to fetch tools',
                        'Perform electrical wiring inside the tank'
                    ],
                    correctOptionIndex: 0,
                    weight: 25
                },
                {
                    questionText: 'Before entering a vessel, at what height levels inside the space should atmospheric gas testing be conducted?',
                    questionType: 'mcq',
                    options: [
                        'Top, middle, and bottom (gases may be lighter or heavier than air)',
                        'Top opening only',
                        'Bottom floor only',
                        'Outside the entrance only'
                    ],
                    correctOptionIndex: 0,
                    weight: 25
                },
                {
                    questionText: 'What action is required if atmospheric testing indicates a Flammable Gas level above 5% LEL (Lower Explosive Limit)?',
                    questionType: 'mcq',
                    options: [
                        'Evacuate immediately or do not enter, investigate source and purge/ventilate',
                        'Proceed with entry using non-sparking boots only',
                        'Turn off the gas detector alarm',
                        'Light a match to test ignition'
                    ],
                    correctOptionIndex: 0,
                    weight: 20
                },
                {
                    questionText: 'Under AS 2865, what written authority must be issued before any person enters a confined space?',
                    questionType: 'mcq',
                    options: [
                        'A Confined Space Entry Permit signed by the Entry Supervisor listing hazards, controls, and attendant details',
                        'A verbal instruction from the site foreman',
                        'A standard safety induction certificate',
                        'A purchase order for gas monitoring equipment'
                    ],
                    correctOptionIndex: 0,
                    weight: 20
                }
            ],
            practicalCriteria: [
                'Identify and inspect confined space entry permit and atmospheric test results',
                'Demonstrate bump test and pre-entry multi-gas detector testing (O2, LEL, H2S, CO)',
                'Set up retrieval tripod, harness winch, and safety line at entry point',
                'Perform Standby Person (Hole Watch) entry logging and communication protocol',
                'Demonstrate non-entry emergency retrieval using tripod winch'
            ]
        }
    },
    {
        certificationName: 'Gas Test Atmospheres',
        description: 'Critical mining hazard module for testing and monitoring toxic and flammable atmospheres on WA resource sites. Delivered online with practical competency validation.',
        course: {
            title: 'MSMWHS217 Conduct gas test atmospheres',
            description: 'Nationally Recognised Unit of Competency MSMWHS217 Conduct gas test atmospheres under Safe Work Australia WES guidance and AS 2865. Covers selecting, calibrating, bump testing, and interpreting multi-gas detectors for oxygen deficiency/enrichment, flammable gases (LEL), and toxic contaminants (H2S, CO, SO2) on industrial and mine sites. Includes issuing gas clearance certificates and emergency response to out-of-range readings.',
            format: 'Mixed',
            price: 190.00,
            duration: 4,
            capacity: 20,
            modules: [
                {
                    title: 'Module 1: Gas Hazards, WES Standards & Detector Technology',
                    durationMinutes: 30,
                    sequenceOrder: 1,
                    contentType: 'TEXT',
                    contentUrl: 'local-content',
                    content: 'Understand the Australian Workplace Exposure Standards (WES) for common mine site gases including O2 (19.5%-23.5% safe range), H2S (TWA 1 ppm, STEL 5 ppm), CO (TWA 20 ppm, STEL 100 ppm), and LEL thresholds. Learn how electrochemical and catalytic bead sensors work and their cross-sensitivity limitations.',
                },
                {
                    title: 'Module 2: Instrument Calibration, Bump Testing & Field Sampling Procedures',
                    durationMinutes: 30,
                    sequenceOrder: 2,
                    contentType: 'TEXT',
                    contentUrl: 'local-content',
                    content: 'Learn the difference between full calibration (span calibration using certified gas mix) and bump testing (functional sensor response check). Understand correct field sampling technique: test at low, mid, and high levels in enclosed spaces before entry, and continuous monitoring during work. Record all results on a Gas Test Clearance Certificate before authorizing entry.',
                }
            ],
            examConfig: {
                passThreshold: 80,
                maxAttempts: 2
            },
            questions: [
                {
                    questionText: 'What does LEL stand for in gas atmosphere testing and what action must be taken if a reading exceeds 5% LEL?',
                    questionType: 'mcq',
                    options: [
                        'Lower Explosive Limit — the minimum gas concentration that will ignite; above 5% LEL the area must be evacuated or not entered until ventilated',
                        'Low Electrical Level — no action required below 10%',
                        'Liquid Environmental Limit — reading is recorded in logbook only',
                        'Long Exposure Level — SCBA must be worn but work may continue'
                    ],
                    correctOptionIndex: 0,
                    weight: 17
                },
                {
                    questionText: 'What is the Safe Work Australia WES Short-Term Exposure Limit (STEL) for Hydrogen Sulfide (H2S)?',
                    questionType: 'mcq',
                    options: [
                        '5 ppm (15-minute average, not to be exceeded)',
                        '100 ppm',
                        '1000 ppm',
                        '50 ppm'
                    ],
                    correctOptionIndex: 0,
                    weight: 17
                },
                {
                    questionText: 'What is the purpose of conducting a Bump Test on a multi-gas monitor before each shift?',
                    questionType: 'mcq',
                    options: [
                        'To briefly expose sensors to a known concentration of test gas to verify sensor response and that audible/visual alarms activate correctly',
                        'To check if the outer casing survives a drop impact',
                        'To clear historical alarm data from internal memory',
                        'To fully recalibrate the instrument to factory settings'
                    ],
                    correctOptionIndex: 0,
                    weight: 17
                },
                {
                    questionText: 'Why is Carbon Monoxide (CO) considered extremely dangerous on mine sites near diesel-powered equipment?',
                    questionType: 'mcq',
                    options: [
                        'It is colorless, odorless, and tasteless — it binds to haemoglobin up to 240x more readily than oxygen, causing fatal hypoxia with no warning',
                        'It has a bright orange glow visible in low light',
                        'It causes immediate skin chemical burns on contact',
                        'It has a strong rotten egg smell detectable at safe levels'
                    ],
                    correctOptionIndex: 0,
                    weight: 17
                },
                {
                    questionText: 'When testing a confined space atmosphere, in what sequence must gas sampling be performed inside the space?',
                    questionType: 'mcq',
                    options: [
                        'Low level first (for heavier-than-air gases like H2S), then mid-level, then top (for lighter-than-air gases like methane) — test all zones before entry',
                        'Top first, then exit without testing lower levels',
                        'Only test at the entry point opening from outside the space',
                        'One random sample at any height is sufficient'
                    ],
                    correctOptionIndex: 0,
                    weight: 16
                },
                {
                    questionText: 'Who has authority to issue a Gas Test Clearance Certificate (GTCC) authorizing confined space or hazardous atmosphere entry?',
                    questionType: 'mcq',
                    options: [
                        'Only a person who holds a current MSMWHS217 (or equivalent) Gas Testing competency and has performed the required atmospheric tests',
                        'Any worker on site regardless of training',
                        'The site safety officer by signing off remotely',
                        'The equipment hire company that supplied the gas detector'
                    ],
                    correctOptionIndex: 0,
                    weight: 16
                }
            ],
            practicalCriteria: [
                'Perform pre-use visual inspection and bump test on a 4-gas monitor (O2, LEL, H2S, CO)',
                'Demonstrate correct multi-level gas sampling procedure (low, mid, high) in a simulated confined space environment',
                'Interpret gas detector readings and correctly identify pass/fail threshold for entry authorization',
                'Complete and sign a Gas Test Clearance Certificate (GTCC) with all required fields',
                'Demonstrate correct emergency response procedure when out-of-range reading is detected mid-task'
            ]
        }
    },
    {
        certificationName: 'Provide First Aid',
        description: 'Workplace medical foundation for emergency response on remote FIFO sites. Meets Australian Resuscitation Council (ARC) 2023 guidelines.',
        course: {
            title: 'HLTAID011 Provide First Aid',
            description: 'Nationally Recognised Unit of Competency HLTAID011 Provide First Aid (includes HLTAID009 Provide CPR). Covers DRSABCD primary survey, high-quality adult/child/infant CPR, Automated External Defibrillator (AED) operation, severe bleeding control, anaphylaxis EpiPen administration, asthma spacer use, Pressure Immobilization Technique (PIT) for snake/spider envenomation, shock management, fracture immobilization, and casualty handover to ambulance service. Valid 3 years (CPR component annual renewal required per Safe Work Australia guidance).',
            format: 'Mixed',
            price: 160.00,
            duration: 8,
            capacity: 20,
            modules: [
                {
                    title: 'Module 1: Emergency Response Framework (DRSABCD & CPR)',
                    durationMinutes: 45,
                    sequenceOrder: 1,
                    contentType: 'TEXT',
                    contentUrl: 'local-content',
                    content: 'Master the DRSABCD primary survey: Danger, Response, Send for Help, Airway, Breathing, CPR, Defibrillation. Learn ARC 2023 CPR guidelines: 30 compressions (5-6 cm depth, 100-120/min rate) to 2 rescue breaths for adults. Understand the Chain of Survival and importance of minimizing interruptions to compressions.',
                },
                {
                    title: 'Module 2: Medical Emergencies — Bleeding, Shock, Anaphylaxis & Asthma',
                    durationMinutes: 40,
                    sequenceOrder: 2,
                    contentType: 'TEXT',
                    contentUrl: 'local-content',
                    content: 'Learn to identify and manage life-threatening bleeding using direct pressure and pressure bandages. Recognize signs of anaphylaxis (hives, throat swelling, collapse) and administer EpiPen auto-injector. Manage asthma attacks using a 4-step asthma action plan with a spacer and puffer. Recognize hypovolaemic shock: pale/cool/clammy skin, rapid weak pulse, altered consciousness.',
                },
                {
                    title: 'Module 3: Environmental & Trauma Emergencies (Snakebite, Burns, Fractures)',
                    durationMinutes: 35,
                    sequenceOrder: 3,
                    contentType: 'TEXT',
                    contentUrl: 'local-content',
                    content: 'Apply Pressure Immobilization Technique (PIT) for Australian snakebite and funnel-web spider envenomation: bandage starting at bite site, extending the full limb length, apply splint, keep casualty still. Manage burn injuries: cool running water for 20 minutes, do not use ice or creams. Immobilize suspected fractures using improvised splints and slings.',
                }
            ],
            examConfig: {
                passThreshold: 80,
                maxAttempts: 2
            },
            questions: [
                {
                    questionText: 'Under Australian Resuscitation Council (ARC) 2023 guidelines, what is the correct compression-to-breath ratio and compression rate for adult CPR?',
                    questionType: 'mcq',
                    options: [
                        '30 compressions to 2 rescue breaths at 100-120 compressions per minute',
                        '15 compressions to 2 breaths at 60 compressions per minute',
                        '5 compressions to 1 breath at 80 compressions per minute',
                        '50 compressions with no breaths at any rate'
                    ],
                    correctOptionIndex: 0,
                    weight: 20
                },
                {
                    questionText: 'What does D stand for in the DRSABCD primary survey and why is it performed first?',
                    questionType: 'mcq',
                    options: [
                        'D - Danger: You must confirm the scene is safe for yourself and bystanders before approaching the casualty to avoid creating additional casualties',
                        'D - Defibrillation: Apply the AED immediately before checking anything else',
                        'D - Diagnosis: Determine the medical condition before taking any action',
                        'D - Documentation: Record the incident time before rendering assistance'
                    ],
                    correctOptionIndex: 0,
                    weight: 20
                },
                {
                    questionText: 'How should an AED (Automated External Defibrillator) be safely operated on an unconscious non-breathing adult?',
                    questionType: 'mcq',
                    options: [
                        'Power on, attach pads to bare dry chest per diagram, clear all persons from casualty, follow voice/visual prompts, deliver shock only when AED advises',
                        'Apply pads over clothing to save time',
                        'Press shock button immediately on attachment before analysis completes',
                        'Immerse the pads briefly in water to improve conductivity'
                    ],
                    correctOptionIndex: 0,
                    weight: 20
                },
                {
                    questionText: 'What is the correct Pressure Immobilization Technique (PIT) for a suspected Australian snake bite on the lower leg?',
                    questionType: 'mcq',
                    options: [
                        'Apply a firm broad bandage directly over the bite site, continue bandaging up the entire limb, apply a splint to immobilize joints, keep the casualty completely still and calm, call 000',
                        'Cut the bite site and attempt to suck out venom',
                        'Apply a tight arterial tourniquet above the bite',
                        'Wash the wound with soap, water, and antiseptic'
                    ],
                    correctOptionIndex: 0,
                    weight: 20
                },
                {
                    questionText: 'A worker on a remote FIFO site collapses with signs of anaphylaxis (swollen lips, hives, difficulty breathing, rapid collapse). What is the correct immediate first aid action?',
                    questionType: 'mcq',
                    options: [
                        'Administer EpiPen (adrenaline auto-injector) to outer mid-thigh, lay casualty flat with legs elevated (unless breathing difficulty), call 000 immediately and monitor for second reaction',
                        'Give the worker water and antihistamine tablets and monitor for 30 minutes',
                        'Apply an ice pack to the throat area and wait for the reaction to pass',
                        'Encourage the worker to walk around to keep blood circulating'
                    ],
                    correctOptionIndex: 0,
                    weight: 20
                }
            ],
            practicalCriteria: [
                'Demonstrate 2 minutes of high-quality continuous adult CPR (30:2) on a floor manikin achieving correct depth (5-6 cm) and rate (100-120/min)',
                'Demonstrate correct AED pad placement, shock delivery sequence, and immediate CPR resumption post-shock',
                'Apply a complete Pressure Immobilization Technique (PIT) bandage to a full limb for simulated snake envenomation',
                'Demonstrate management of severe arterial bleeding using direct pressure dressing and roller bandage',
                'Demonstrate correct EpiPen administration technique on a training device and post-administration monitoring steps',
                'Perform structured casualty handover to simulated emergency services (who, what, when, where, why)'
            ]
        }
    }
];
