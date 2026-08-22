import { eehaQuestions } from './questions/eehaQuestions';
import { std11Questions } from './questions/std11Questions';
import { whiteCardQuestions } from './questions/whiteCardQuestions';
import { workingAtHeightsQuestions } from './questions/workingAtHeightsQuestions';
import { confinedSpaceQuestions } from './questions/confinedSpaceQuestions';
import { gasTestQuestions } from './questions/gasTestQuestions';
import { firstAidQuestions } from './questions/firstAidQuestions';
import { policeClearanceQuestions } from './questions/policeClearanceQuestions';
import { driversLicenceQuestions } from './questions/driversLicenceQuestions';
import { commercialCookeryQuestions } from './questions/commercialCookeryQuestions';
import { foodSafetyQuestions } from './questions/foodSafetyQuestions';
import { rsaQuestions } from './questions/rsaQuestions';
import { forkliftQuestions } from './questions/forkliftQuestions';

import { eehaModules } from './modules/eehaModules';
import { std11Modules } from './modules/std11Modules';
import { whiteCardModules } from './modules/whiteCardModules';
import { workingAtHeightsModules } from './modules/workingAtHeightsModules';
import { confinedSpaceModules } from './modules/confinedSpaceModules';
import { gasTestModules } from './modules/gasTestModules';
import { firstAidModules } from './modules/firstAidModules';
import { policeClearanceModules } from './modules/policeClearanceModules';
import { driversLicenceModules } from './modules/driversLicenceModules';
import { commercialCookeryModules } from './modules/commercialCookeryModules';
import { foodSafetyModules } from './modules/foodSafetyModules';
import { rsaModules } from './modules/rsaModules';
import { forkliftModules } from './modules/forkliftModules';

export const lmsSeedData = [
    {
        certificationName: 'UEERL0004 EEHA Certification',
        description: 'Electrical Equipment in Hazardous Areas (EEHA) advanced trade prerequisite for hazardous mining and energy environments.',
        course: {
            title: 'UEERL0004 Conduct testing and maintenance of electrical equipment in hazardous areas',
            description: 'Advanced trade qualification covering electrical protection principles, explosive gas/dust atmosphere classification, flameproof (Ex d), increased safety (Ex e), intrinsic safety (Ex i), encapsulation (Ex m), purge/pressurization (Ex p), visual and detailed inspections under AS/NZS 60079 series, and maintenance logging for WA resource sites.',
            format: 'Mixed',
            price: 1850.00,
            duration: 40,
            capacity: 10,
            modules: eehaModules,
            examConfig: {
                passThreshold: 80,
                maxAttempts: 2
            },
            questions: eehaQuestions,
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
        certificationName: 'STD11 Standard 11 Surface Mining Safety Induction',
        description: 'Mandatory core surface site safety induction for Western Australia and Queensland mining environments.',
        course: {
            title: 'STD11 Standard 11 Surface Mining Safety Induction',
            description: 'Recognized surface mining safety induction program covering hazard identification, risk management (SLAM/Take 5), personal safety equipment, isolation and tagging (Out of Service / Personal Isolation), emergency response, fire safety, and environmental awareness on resource sites.',
            format: 'Mixed',
            price: 690.00,
            duration: 16,
            capacity: 15,
            modules: std11Modules,
            examConfig: {
                passThreshold: 80,
                maxAttempts: 2
            },
            questions: std11Questions,
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
        certificationName: 'CPCWHS1001 White Card WA',
        description: 'Mandatory General Construction Induction certification required before entering any Australian construction or FIFO resource work site under WHS Regulations 2022.',
        course: {
            title: 'CPCWHS1001 Prepare to work safely in the construction industry',
            description: 'Nationally Recognised Unit of Competency CPCWHS1001 Prepare to work safely in the construction industry (General Construction Induction Card / White Card). Covers health and safety legislative requirements, basic risk management principles, duty of care under WHS Act 2011, hazard identification, Safe Work Method Statements (SWMS), incident reporting, safety sign comprehension, personal protective equipment (PPE) selection and inspection, and emergency evacuation procedures.',
            format: 'Mixed',
            price: 95.00,
            duration: 6,
            capacity: 25,
            modules: whiteCardModules,
            examConfig: {
                passThreshold: 80,
                maxAttempts: 2
            },
            questions: whiteCardQuestions,
            practicalCriteria: [
                'Demonstrate correct fitting and pre-use inspection of 4 mandatory PPE items (Hard hat, High-Vis, Safety Glasses, Hearing Protection)',
                'Identify 3 site hazard signs (Danger, Mandatory, Emergency Warning) and explain required actions',
                'Demonstrate verbal hazard notification and completion of a site Incident/Hazard Report form',
                'Demonstrate emergency evacuation path identification and assembly point procedure'
            ]
        }
    },
    {
        certificationName: 'RIIWHS204E Work safely at heights',
        description: 'Required for any FIFO/mining role operating at heights under Australian WHS Regulations 2022.',
        course: {
            title: 'RIIWHS204E Work safely at heights',
            description: 'Nationally Recognised Unit of Competency RIIWHS204E Work safely at heights under AS/NZS 1891 and WHS Regulations 2022. Covers planning and preparing for working at heights, identifying hazards, selecting and inspecting fall arrest systems, installing anchor points, using ladders and elevated work platforms (EWPs), fitting full body harnesses, and executing emergency rescue response.',
            format: 'Mixed',
            price: 270.00,
            duration: 8,
            capacity: 15,
            modules: workingAtHeightsModules,
            examConfig: {
                passThreshold: 80,
                maxAttempts: 2
            },
            questions: workingAtHeightsQuestions,
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
        certificationName: 'RIIWHS202E Enter and work in confined spaces',
        description: 'Required for roles that involve entering or working in confined spaces under AS 2865.',
        course: {
            title: 'RIIWHS202E Enter and work in confined spaces',
            description: 'Nationally Recognised Unit of Competency RIIWHS202E Enter and work in confined spaces under AS 2865. Covers identifying confined spaces, atmospheric testing, isolation and lockout, standby observer (hole watch) duties, entry permits, and emergency retrieval.',
            format: 'Mixed',
            price: 290.00,
            duration: 8,
            capacity: 12,
            modules: confinedSpaceModules,
            examConfig: {
                passThreshold: 80,
                maxAttempts: 2
            },
            questions: confinedSpaceQuestions,
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
        certificationName: 'MSMWHS217 Conduct gas test atmospheres',
        description: 'Critical mining hazard module for testing and monitoring toxic and flammable atmospheres on WA resource sites. Delivered online with practical competency validation.',
        course: {
            title: 'MSMWHS217 Conduct gas test atmospheres',
            description: 'Nationally Recognised Unit of Competency MSMWHS217 Conduct gas test atmospheres under Safe Work Australia WES guidance and AS 2865. Covers selecting, calibrating, bump testing, and interpreting multi-gas detectors for oxygen deficiency/enrichment, flammable gases (LEL), and toxic contaminants (H2S, CO, SO2) on industrial and mine sites. Includes issuing gas clearance certificates and emergency response to out-of-range readings.',
            format: 'Mixed',
            price: 190.00,
            duration: 4,
            capacity: 20,
            modules: gasTestModules,
            examConfig: {
                passThreshold: 80,
                maxAttempts: 2
            },
            questions: gasTestQuestions,
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
        certificationName: 'HLTAID011 Provide First Aid',
        description: 'Workplace medical foundation for emergency response on remote FIFO sites. Meets Australian Resuscitation Council (ARC) 2023 guidelines.',
        course: {
            title: 'HLTAID011 Provide First Aid',
            description: 'Nationally Recognised Unit of Competency HLTAID011 Provide First Aid (includes HLTAID009 Provide CPR). Covers DRSABCD primary survey, high-quality adult/child/infant CPR, Automated External Defibrillator (AED) operation, severe bleeding control, anaphylaxis EpiPen administration, asthma spacer use, Pressure Immobilization Technique (PIT) for snake/spider envenomation, shock management, fracture immobilization, and casualty handover to ambulance service. Valid 3 years (CPR component annual renewal required per Safe Work Australia guidance).',
            format: 'Mixed',
            price: 160.00,
            duration: 8,
            capacity: 20,
            modules: firstAidModules,
            examConfig: {
                passThreshold: 80,
                maxAttempts: 2
            },
            questions: firstAidQuestions,
            practicalCriteria: [
                'Demonstrate 2 minutes of high-quality continuous adult CPR (30:2) on a floor manikin achieving correct depth (5-6 cm) and rate (100-120/min)',
                'Demonstrate correct AED pad placement, shock delivery sequence, and immediate CPR resumption post-shock',
                'Apply a complete Pressure Immobilization Technique (PIT) bandage to a full limb for simulated snake envenomation',
                'Demonstrate management of severe arterial bleeding using direct pressure dressing and roller bandage',
                'Demonstrate correct EpiPen administration technique on a training device and post-administration monitoring steps',
                'Perform structured casualty handover to simulated emergency services (who, what, when, where, why)'
            ]
        }
    },
    {
        certificationName: 'NPC National Police Clearance',
        description: 'Official document confirming no disclosable court outcomes (NDCO) — mandatory for FIFO site access and visa sponsorship eligibility.',
        course: {
            title: 'NPC National Police Clearance — Requirements & Submission',
            description: 'Awareness course covering the purpose, application process, and submission requirements for an Australian National Police Clearance (NPC) issued by state police or the ACIC. Covers identification requirements, processing times, document validity windows (3–12 months), employer submission standards, and NDCO interpretation.',
            format: 'Online',
            price: 0,
            duration: 1,
            capacity: 999,
            modules: policeClearanceModules,
            examConfig: {
                passThreshold: 80,
                maxAttempts: 3
            },
            questions: policeClearanceQuestions,
            practicalCriteria: []
        }
    },
    {
        certificationName: 'DL-C Australian Drivers Licence (Class C)',
        description: 'Current Class C licence (manual or automatic) — required for all FIFO roles involving light vehicle operation on camp and mine access roads.',
        course: {
            title: 'DL-C Australian Class C Drivers Licence — FIFO Requirements',
            description: 'Awareness course covering Australian Class C licence classes, FIFO site mobility requirements, document verification standards, international licence acceptance periods, and correct submission procedure for employment screening.',
            format: 'Online',
            price: 0,
            duration: 1,
            capacity: 999,
            modules: driversLicenceModules,
            examConfig: {
                passThreshold: 80,
                maxAttempts: 3
            },
            questions: driversLicenceQuestions,
            practicalCriteria: []
        }
    },
    {
        certificationName: 'SIT30821 Certificate III in Commercial Cookery',
        description: 'Code SIT30821 — Baseline formal culinary qualification for professional chef roles in FIFO camp catering.',
        course: {
            title: 'SIT30821 Certificate III in Commercial Cookery',
            description: 'Nationally Recognised Qualification SIT30821 Certificate III in Commercial Cookery. Covers kitchen operations, mise en place, dry/moist/combination cookery methods, HACCP-based food safety, allergen management, dietary needs for large workforces, and commercial-grade equipment operation for FIFO camp catering environments.',
            format: 'Mixed',
            price: 3200.00,
            duration: 400,
            capacity: 12,
            modules: commercialCookeryModules,
            examConfig: {
                passThreshold: 75,
                maxAttempts: 2
            },
            questions: commercialCookeryQuestions,
            practicalCriteria: [
                'Demonstrate mise en place for a 3-course menu within time constraints',
                'Cook a primary protein to the correct safe internal temperature and verify with a probe thermometer',
                'Complete a HACCP-based cooling log for a batch of cooked food',
                'Identify and correctly label all 14 FSANZ declarable allergens present in a dish'
            ]
        }
    },
    {
        certificationName: 'SITXFSA005/SITXFSA006 Food Safety Supervisor',
        description: 'Codes SITXFSA005/SITXFSA006 — Required by FSANZ Standard 3.2.2A for supervisory roles in FIFO camp catering kitchens.',
        course: {
            title: 'SITXFSA005 Use Hygienic Practices for Food Safety & SITXFSA006 Participate in Safe Food Handling Practices',
            description: 'Food Safety Supervisor (FSS) certification covering HACCP principles, personal hygiene obligations, temperature danger zone controls (5°C–60°C), the 2-hour/4-hour rule, probe thermometer calibration, allergen management under FSANZ Standard 1.2.3, cross-contamination prevention, and FSS legal responsibilities under Standard 3.2.2A.',
            format: 'Mixed',
            price: 195.00,
            duration: 8,
            capacity: 20,
            modules: foodSafetyModules,
            examConfig: {
                passThreshold: 80,
                maxAttempts: 2
            },
            questions: foodSafetyQuestions,
            practicalCriteria: [
                'Calibrate a probe thermometer using the ice slurry method (0°C ±1°C)',
                'Demonstrate correct 6-step hand-washing technique within 45 seconds',
                'Identify 3 cross-contamination risks in a scenario kitchen and state the correct control for each',
                'Complete a HACCP temperature log entry for a meal service including corrective action for an out-of-range reading'
            ]
        }
    },
    {
        certificationName: 'SITHFAB021 Responsible Service of Alcohol (RSA)',
        description: 'Code SITHFAB021 — Mandatory for any role serving or supervising alcohol on a licensed FIFO camp social club or bar.',
        course: {
            title: 'SITHFAB021 Responsible Service of Alcohol',
            description: 'Nationally Recognised Unit of Competency SITHFAB021 Responsible Service of Alcohol. Covers Australian liquor licensing legislation, duty of care obligations, identifying intoxication, BAC and contributing factors, responsible service strategies, refusal of service techniques, de-escalation of aggressive patrons, and legal consequences for breaches. Required for all staff serving or supervising alcohol on FIFO licensed premises.',
            format: 'Online',
            price: 120.00,
            duration: 4,
            capacity: 30,
            modules: rsaModules,
            examConfig: {
                passThreshold: 80,
                maxAttempts: 2
            },
            questions: rsaQuestions,
            practicalCriteria: [
                'Demonstrate correct RSA refusal-of-service technique using role-play scenario',
                'Correctly identify 5 visible signs of intoxication from a case study scenario',
                'Demonstrate de-escalation of an aggressive patron using verbal and spatial techniques'
            ]
        }
    },
    {
        certificationName: 'TLILIC2001 Licence to operate a forklift truck',
        description: 'Code TLILIC2001 — High Risk Work Licence (LF class) required for forklift operation in FIFO warehouses and laydown areas.',
        course: {
            title: 'TLILIC2001 Licence to operate a forklift truck',
            description: 'High Risk Work Licence (LF class) covering forklift types, major mechanical components, pre-operational checklists, the Stability Triangle, load centre and data plate interpretation, safe load handling, ramp operation, pedestrian safety, blind spot awareness, LPG cylinder changeover, and electric battery charging safety. Issued under WHS Regulations 2011.',
            format: 'Mixed',
            price: 450.00,
            duration: 16,
            capacity: 8,
            modules: forkliftModules,
            examConfig: {
                passThreshold: 80,
                maxAttempts: 2
            },
            questions: forkliftQuestions,
            practicalCriteria: [
                'Complete documented pre-operational inspection identifying at least 2 simulated faults',
                'Demonstrate correct load pick-up, travel posture, and stacking to height on marked bays',
                'Demonstrate ramp operation with load uphill in both ascending and descending directions',
                'Demonstrate correct LPG cylinder changeover procedure from valve-off to seal-check',
                'Navigate a pedestrian/forklift shared zone using horn at every blind intersection'
            ]
        }
    },
];
