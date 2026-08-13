"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lmsSeedData = void 0;
const eehaQuestions_1 = require("./questions/eehaQuestions");
const std11Questions_1 = require("./questions/std11Questions");
const whiteCardQuestions_1 = require("./questions/whiteCardQuestions");
const workingAtHeightsQuestions_1 = require("./questions/workingAtHeightsQuestions");
const confinedSpaceQuestions_1 = require("./questions/confinedSpaceQuestions");
const gasTestQuestions_1 = require("./questions/gasTestQuestions");
const firstAidQuestions_1 = require("./questions/firstAidQuestions");
const eehaModules_1 = require("./modules/eehaModules");
const std11Modules_1 = require("./modules/std11Modules");
const whiteCardModules_1 = require("./modules/whiteCardModules");
const workingAtHeightsModules_1 = require("./modules/workingAtHeightsModules");
const confinedSpaceModules_1 = require("./modules/confinedSpaceModules");
const gasTestModules_1 = require("./modules/gasTestModules");
const firstAidModules_1 = require("./modules/firstAidModules");
exports.lmsSeedData = [
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
            modules: eehaModules_1.eehaModules,
            examConfig: {
                passThreshold: 80,
                maxAttempts: 2
            },
            questions: eehaQuestions_1.eehaQuestions,
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
            modules: std11Modules_1.std11Modules,
            examConfig: {
                passThreshold: 80,
                maxAttempts: 2
            },
            questions: std11Questions_1.std11Questions,
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
            modules: whiteCardModules_1.whiteCardModules,
            examConfig: {
                passThreshold: 80,
                maxAttempts: 2
            },
            questions: whiteCardQuestions_1.whiteCardQuestions,
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
            modules: workingAtHeightsModules_1.workingAtHeightsModules,
            examConfig: {
                passThreshold: 80,
                maxAttempts: 2
            },
            questions: workingAtHeightsQuestions_1.workingAtHeightsQuestions,
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
            modules: confinedSpaceModules_1.confinedSpaceModules,
            examConfig: {
                passThreshold: 80,
                maxAttempts: 2
            },
            questions: confinedSpaceQuestions_1.confinedSpaceQuestions,
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
            modules: gasTestModules_1.gasTestModules,
            examConfig: {
                passThreshold: 80,
                maxAttempts: 2
            },
            questions: gasTestQuestions_1.gasTestQuestions,
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
            modules: firstAidModules_1.firstAidModules,
            examConfig: {
                passThreshold: 80,
                maxAttempts: 2
            },
            questions: firstAidQuestions_1.firstAidQuestions,
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
