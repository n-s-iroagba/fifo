export const gasTestModules = [
    {
        title: "Module 1: Atmospheric Hazards — Oxygen & Flammable Limits",
        durationMinutes: 45,
        sequenceOrder: 1,
        contentType: 'TEXT',
        contentUrl: null,
        content: `GAS TEST ATMOSPHERES (MSMWHS217) — OXYGEN & FLAMMABILITY

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1: THE PURPOSE OF ATMOSPHERIC TESTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Atmospheric testing is a critical, life-saving diagnostic process required before personnel enter a confined space, before "hot work" (welding, grinding, cutting) commences in a hazardous area, and during emergency response. The human senses (sight, smell, taste) are completely inadequate for detecting atmospheric hazards. Many lethal gases are colourless and odourless (like Carbon Monoxide), while others paralyse the olfactory nerve (like Hydrogen Sulfide), rendering the sense of smell useless right when it is needed most.

An Authorised Gas Tester (AGT) uses highly calibrated electronic instruments to evaluate the atmosphere against three primary criteria:
1. Oxygen Concentration (Is there enough to breathe, but not so much it accelerates fire?)
2. Combustible/Flammable Gases (Is there an explosion risk?)
3. Toxic Gases (Are there poisons present above allowable exposure limits?)

Testing must always follow this exact sequence: Oxygen first, Flammability second, Toxicity third.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2: OXYGEN CONCENTRATION (O₂)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Normal, fresh ambient air consists of:
→ 78.1% Nitrogen
→ 20.9% Oxygen
→ 0.9% Argon
→ 0.1% Carbon Dioxide and other trace gases.

The Safe Operating Range for Oxygen under Australian Standard AS 2865 is strictly between 19.5% and 23.5% by volume.

OXYGEN DEFICIENCY (< 19.5%)
Oxygen levels can drop for two main reasons:
1. Consumption: Biological (bacteria in sewers), Chemical (rusting/oxidation of steel tanks), or Combustion (welding or fires).
2. Displacement: Another gas (like Nitrogen, Argon, CO₂, or Methane) enters the space and pushes the oxygen out.

Symptoms of Depletion:
→ 19.5%: Minimum safe level.
→ 15-19%: Decreased ability to work strenuously. Impaired coordination. Early symptoms may go unnoticed.
→ 12-15%: Respiration increases in rate and depth. Poor judgment, lips turning blue.
→ 10-12%: Mental failure, fainting, nausea, vomiting.
→ 6-10%: 8 minutes = 100% fatal; 6 minutes = 50% fatal; 4-5 minutes = recovery with treatment.
→ < 6%: Immediate coma and death within minutes.

OXYGEN ENRICHMENT (> 23.5%)
An atmosphere containing more than 23.5% oxygen is extremely dangerous due to the drastically increased risk of fire and explosion.
→ In an oxygen-enriched atmosphere, materials that normally will not burn (like fire-retardant clothing, heavy grease, and even some metals) will ignite easily and burn violently.
→ A spark that would normally extinguish in air can cause a catastrophic flash fire.
→ Causes of enrichment include leaking oxy-acetylene welding hoses left inside a space, or the incredibly dangerous (and strictly prohibited) practice of using pure oxygen to "ventilate" a space.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3: FLAMMABLE AND COMBUSTIBLE GASES (% LEL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For a fire or explosion to occur, three elements must be present in the correct proportions: Fuel, Oxygen, and an Ignition Source (The Fire Triangle). Gas testing measures the "Fuel" component.

LOWER EXPLOSIVE LIMIT (LEL)
The LEL is the absolute minimum concentration of a combustible gas or vapour in the air that will ignite if a source of ignition is present.
→ If the gas concentration is BELOW the LEL, the mixture is "too lean" to burn.

UPPER EXPLOSIVE LIMIT (UEL)
The UEL is the maximum concentration of a combustible gas or vapour in the air that will ignite.
→ If the gas concentration is ABOVE the UEL, the mixture is "too rich" to burn (there is too much fuel and not enough oxygen to support combustion).

THE FLAMMABLE RANGE
The range between the LEL and the UEL is the Flammable (or Explosive) Range. If the gas concentration falls anywhere within this range, an explosion will occur if an ignition source is introduced.
Example: Methane (CH₄)
→ LEL: 5.0% by volume in air.
→ UEL: 15.0% by volume in air.
→ Flammable Range: 5% to 15%.

HOW GAS DETECTORS DISPLAY FLAMMABILITY (% LEL)
Gas detectors do not display the absolute volume of the gas. They display the percentage of the Lower Explosive Limit (% LEL).
→ If a detector reads 100% LEL, it means the gas concentration has reached the absolute bottom edge of the flammable range. (For Methane, a reading of 100% LEL means there is exactly 5% volume of Methane in the air).
→ An atmosphere is explosive at 100% LEL.

LEGAL THRESHOLDS FOR ENTRY AND HOT WORK
Because a reading of 100% LEL is already explosive, workplace safety requires a massive safety margin.
→ Confined Space Entry: Entry is permitted if the reading is strictly LESS THAN 5% LEL (with continuous monitoring). Between 5% and 10% LEL, entry is only permitted under strict emergency controls. At > 10% LEL, all personnel must evacuate immediately.
→ Hot Work (Welding/Grinding): Hot work is strictly prohibited if the reading is > 0% LEL in the immediate vicinity.`
    },
    {
        title: "Module 2: Toxic Gases, Vapour Density & Exposure Standards",
        durationMinutes: 45,
        sequenceOrder: 2,
        contentType: 'TEXT',
        contentUrl: null,
        content: `TOXIC GASES, VAPOUR DENSITY & EXPOSURE STANDARDS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1: MEASURING TOXICITY — PPM AND EXPOSURE STANDARDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Unlike oxygen (measured in % by volume) or flammability (measured in % LEL), toxic gases are lethal in microscopic amounts. They are measured in Parts Per Million (ppm). To visualise 1 ppm: it is equivalent to one drop of ink diluted into a 50-litre drum of water, or one second in 11.5 days.

SAFE WORK AUSTRALIA EXPOSURE STANDARDS
To protect workers, Safe Work Australia publishes Workplace Exposure Standards (WES) for airborne contaminants. Gas testers must evaluate their readings against these legal limits:

1. TWA (Time-Weighted Average):
The maximum average airborne concentration of a substance calculated over an 8-hour working day, for a 5-day working week, that nearly all workers may be repeatedly exposed to without adverse health effects.

2. STEL (Short Term Exposure Limit):
A 15-minute time-weighted average exposure limit which must not be exceeded at any time during a working day, even if the 8-hour TWA is within limits. Exposures at the STEL should not be longer than 15 minutes and should not be repeated more than four times a day (with at least 60 minutes between exposures).

3. Peak Limitation:
A maximum or peak airborne concentration of a substance determined over the shortest analytically practicable period of time, which must not be exceeded at any time.

4. IDLH (Immediately Dangerous to Life or Health):
The concentration of an airborne contaminant that is likely to cause death, immediate or delayed permanent adverse health effects, or prevent escape from such an environment. (This is a US NIOSH standard heavily referenced in Australian emergency response).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2: COMMON INDUSTRIAL TOXIC GASES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HYDROGEN SULFIDE (H₂S)
A highly toxic, colourless gas generated by the anaerobic decomposition of organic matter (sulfate-reducing bacteria). Common in sewers, wastewater treatment, manure pits, and crude oil/natural gas extraction (sour gas).
→ Odour: "Rotten eggs" at very low levels (0.01 to 1.5 ppm).
→ The Lethal Trap (Olfactory Fatigue): At concentrations around 10 to 15 ppm, H₂S rapidly paralyses the olfactory nerve. The victim loses the ability to smell the gas entirely. They may falsely believe the gas has cleared, right before the concentration rises to lethal levels.
→ Exposure Standards: TWA = 10 ppm; STEL = 15 ppm.
→ Severe Effects: 300-500 ppm causes rapid unconsciousness. 1000+ ppm causes instant death (the "knockdown" effect).

CARBON MONOXIDE (CO)
A highly toxic, colourless, odourless, and tasteless gas produced by incomplete combustion of carbon-based fuels (petrol, diesel, LPG, wood, coal). Common around internal combustion engines operating indoors, blast furnaces, and underground mine fires.
→ Mechanism of Action: CO binds to haemoglobin in red blood cells approximately 210 times more strongly than oxygen does. It forms carboxyhaemoglobin (COHb), effectively suffocating the victim at a cellular level, even if the atmospheric oxygen level is perfectly normal at 20.9%.
→ Symptoms: Headache, dizziness, nausea, cherry-red skin colour (late stage), confusion, collapse.
→ Exposure Standards: TWA = 30 ppm.
→ IDLH: 1200 ppm.

AMMONIA (NH₃)
A colourless, highly irritating gas with a sharp, suffocating, pungent odour. Heavily used in industrial refrigeration systems and fertiliser manufacturing.
→ Mechanism: Ammonia reacts violently with moisture to form ammonium hydroxide, a caustic chemical. It severely burns the eyes, respiratory tract, and lungs, leading to pulmonary oedema (drowning in your own lung fluid).
→ Exposure Standards: TWA = 25 ppm; STEL = 35 ppm.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3: VAPOUR DENSITY & STRATIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Gases do not automatically mix evenly in the air. They stratify (form layers) based on their Vapour Density.
Air is assigned a relative vapour density of 1.0.

HEAVIER THAN AIR (Density > 1.0)
These gases sink and pool in the lowest points: sumps, trenches, drains, and the bottom of tanks.
→ Hydrogen Sulfide (H₂S): Density 1.19 (Sinks)
→ Carbon Dioxide (CO₂): Density 1.53 (Sinks)
→ Propane (LPG): Density 1.56 (Sinks heavily)
→ Sulphur Dioxide (SO₂): Density 2.26 (Sinks heavily)

LIGHTER THAN AIR (Density < 1.0)
These gases rise and accumulate in the highest points: the apex of a roof, the top dome of a tank, or above ceiling panels.
→ Methane (CH₄): Density 0.55 (Rises)
→ Ammonia (NH₃): Density 0.60 (Rises)
→ Hydrogen (H₂): Density 0.07 (Rises rapidly)

NEUTRALLY BUOYANT (Density ≈ 1.0)
These gases mix readily and evenly with normal air and travel with air currents.
→ Carbon Monoxide (CO): Density 0.97 (Mixes evenly throughout the space)

Testing Implications:
Because of vapour density, an AGT must NEVER rely on a single air sample taken from the access hatch. A hatch reading might show perfect 20.9% oxygen and 0 ppm H₂S, while a lethal, heavy pool of H₂S sits undisturbed at the bottom of the tank. Stratified testing (Top, Middle, Bottom) is an absolute mandatory requirement.`
    },
    {
        title: "Module 3: Gas Detector Technology & Calibration",
        durationMinutes: 45,
        sequenceOrder: 3,
        contentType: 'TEXT',
        contentUrl: null,
        content: `GAS DETECTOR TECHNOLOGY, LIMITATIONS & CALIBRATION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1: SENSOR TECHNOLOGIES AND HOW THEY FAIL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A gas tester is only as good as their instrument, and every instrument has profound technological limitations. Understanding how the sensors work is the only way to know when they are lying to you.

1. CATALYTIC BEAD (PELLISTOR) SENSORS — FOR LEL / COMBUSTIBLES
The most common sensor used for detecting explosive gases (% LEL). It contains a tiny ceramic bead coated with a catalyst and wrapped in a platinum wire coil.
→ How it works: The wire is electrically heated. When combustible gas enters the sensor, it literally burns (oxidises) on the catalyst bead. This miniature fire raises the temperature of the wire, changing its electrical resistance. The detector measures this resistance change and converts it to a % LEL reading on the screen.
→ CRITICAL LIMITATION 1 — The Oxygen Requirement: Because the sensor literally burns the gas, it requires oxygen to function. If a space is severely oxygen-deficient (e.g., nitrogen purged, < 10% O₂), the combustible gas cannot burn on the bead. The detector will read 0% LEL, even if the space is completely filled with explosive methane. This false zero has killed operators. (This is why Oxygen is ALWAYS tested first).
→ CRITICAL LIMITATION 2 — Sensor Poisoning: The catalyst bead can be permanently ruined ("poisoned") by exposure to silicone vapours (found in WD-40, sealants, armor-all), leaded petrol, or high concentrations of H₂S. Once poisoned, the sensor will read 0% LEL in the presence of explosive gas.

2. ELECTROCHEMICAL (EC) SENSORS — FOR TOXIC GASES AND OXYGEN
Used for detecting specific toxic gases (H₂S, CO, NH₃, Cl₂) and Oxygen (O₂).
→ How it works: Gas passes through a semi-permeable membrane into a liquid electrolyte. It reacts with an electrode, generating a tiny electrical current proportional to the gas concentration.
→ Limitations: Electrochemical sensors degrade over time, whether they are used or not (typical lifespan 2-3 years). Extreme cold slows the chemical reaction (sluggish response). Extreme dryness can dry out the electrolyte. They also suffer from "cross-sensitivity." For example, a high concentration of Hydrogen gas might cause an EC sensor configured for Carbon Monoxide to display a false CO reading.

3. NON-DISPERSIVE INFRARED (NDIR) SENSORS — FOR LEL AND CO₂
Used for combustible gases and CO₂.
→ How it works: Shines an infrared light beam through the gas sample. Specific hydrocarbon gases absorb specific wavelengths of infrared light. The sensor measures how much light is absorbed to determine the concentration.
→ Advantage: NDIR sensors do NOT need oxygen to work. They can accurately measure combustible gas in a nitrogen-purged (0% O₂) environment. They also cannot be poisoned by silicones.
→ Limitation: They cannot detect Hydrogen gas (H₂). If you use an NDIR LEL sensor in a battery charging room (which produces explosive Hydrogen), it will read 0% LEL even right before an explosion.

4. PHOTOIONISATION DETECTORS (PID) — FOR VOLATILE ORGANIC COMPOUNDS (VOCS)
Used for detecting complex solvents, jet fuels, benzene, and complex hydrocarbons that catalytic sensors struggle with.
→ How it works: Uses high-energy ultraviolet (UV) light to strip an electron off the gas molecules (ionisation), creating an electrical current.
→ Limitations: Extremely sensitive to humidity and moisture. PIDs are broad-spectrum detectors — they will tell you there is a VOC present in the parts-per-billion range, but they cannot tell you exactly WHICH chemical it is without advanced filtering.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2: BUMP TESTING AND CALIBRATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A gas detector is life-support equipment. You must prove it works before betting your life on it. Turning the detector on and seeing the screen light up in fresh air proves nothing — it only proves the battery works. It does not prove the sensors can detect gas, or that the alarms will sound.

THE BUMP TEST (FUNCTION TEST)
A bump test is the only way to verify sensor functionality. It must be performed BEFORE EACH DAY'S USE.
→ What is it? A brief exposure of the monitor to a known concentration of a certified calibration gas mixture.
→ The Goal: To verify that the sensors respond accurately to the gas, and that all alarms (audible, visual, and vibrating) activate when the set points are exceeded.
→ If a monitor fails a bump test, it must be removed from service immediately and subjected to a full calibration.

FULL CALIBRATION
Calibration is a more rigorous, electronic adjustment of the monitor.
→ What is it? The monitor is exposed to a certified calibration gas. The instrument's internal software then adjusts its baseline readings to perfectly match the known concentration of the gas in the cylinder, correcting for sensor drift and degradation over time.
→ Frequency: Must be performed according to the manufacturer's specifications (typically every 3 to 6 months), or immediately if the unit fails a bump test, is dropped, or is exposed to a massive over-range concentration of gas (e.g., accidentally dropping the unit into a highly toxic sewer).

THE ZERO CALIBRATION (FRESH AIR SETUP)
Zeroing the instrument establishes its baseline in clean air.
→ O₂ should read 20.9%.
→ LEL should read 0%.
→ Toxics should read 0 ppm.
→ Critical Rule: You must ONLY perform a zero calibration in a known fresh air environment (outside the plant, upwind of any processes). If you zero the monitor inside a room that happens to contain 20 ppm of Carbon Monoxide, the monitor will set 20 ppm as its new "zero." When you enter a highly toxic area with 50 ppm, the monitor will only display 30 ppm, fatally masking the true hazard.`
    },
    {
        title: "Module 4: Gas Testing Protocols, Stratification & Hot Work Permits",
        durationMinutes: 45,
        sequenceOrder: 4,
        contentType: 'TEXT',
        contentUrl: null,
        content: `GAS TESTING PROTOCOLS, CLEARANCE & HOT WORK PERMITTING

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1: THE STRATIFIED TESTING PROTOCOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before authorising entry into a confined space or trench, the Authorised Gas Tester (AGT) must conduct a thorough, stratified assessment of the atmosphere from the outside (pre-entry testing).

Because of differences in Vapour Density (discussed in Module 2), gases layer at different heights. A single test at the access hatch is invalid and legally negligent.

The Mandatory Testing Sequence:
Testing must be conducted at the TOP, MIDDLE, and BOTTOM of the space.

1. Pre-Test Equipment Check:
→ Ensure the gas detector is within its calibration date.
→ Perform a Bump Test to verify sensor response.
→ Perform a Fresh Air Zero in a clean environment.
→ Attach the sample probe, sample tubing, and activate the internal suction pump (or use a manual aspirator bulb).
→ Perform a block test (block the end of the probe with your finger) to ensure the pump stalls and alarms, proving there are no leaks in the tubing.

2. Testing at the Opening (Crack Test):
→ Before fully opening a hatch, test the atmosphere by cracking the seal slightly or testing through a vent hole. This detects highly pressurised toxic gases that might rush out and engulf the tester.

3. Testing Depth Increments:
→ Lower the sample tubing slowly into the space.
→ The AGT must understand the "Response Time" (T90) of their instrument and the "Sample Delay Time" of the tubing.
→ A standard pump draws air at about 0.5 litres per minute. It takes approximately 1 to 2 seconds for a gas sample to travel 1 metre up the tubing.
→ If you are using 10 metres of tubing, the gas takes 10 to 20 seconds just to reach the sensors, plus another 15 seconds for the sensors to fully react.
→ Therefore, you must stop lowering the tube, hold it steady at the target depth, and WAIT at least 30 to 45 seconds for the reading to stabilise before recording the result and lowering it to the next depth. Dropping the hose quickly to the bottom and pulling it straight back up will miss heavy gas layers entirely.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2: CONTINUOUS MONITORING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Initial pre-entry testing only proves the atmosphere is safe at the exact moment the test was performed. Confined space atmospheres are dynamic and can change rapidly.

Causes of sudden atmospheric changes:
→ Disturbing sludge or sediment at the bottom of a tank, releasing trapped H₂S bubbles.
→ Temperature changes causing liquids to evaporate into volatile VOC vapours.
→ Hot work (welding/cutting) consuming oxygen and generating toxic metal fumes and CO.
→ Failure of the forced ventilation system.

Due to these risks, entrants must wear Personal Gas Monitors continuously while inside the space. These monitors are set in a "diffusion" mode (no pump), constantly analyzing the air immediately in the worker's breathing zone.

If any alarm on a personal monitor activates during work, all entrants must evacuate the space immediately without investigation. The AGT must then re-assess the space from the outside to determine the cause of the alarm.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3: HOT WORK AND GAS TESTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"Hot Work" is any operation that involves open flames, produces heat, or generates sparks. This includes welding, oxy-cutting, grinding, brazing, and even the use of non-intrinsically safe electrical equipment (like a standard drill or camera) in a hazardous area.

The Hot Work Permit System:
Before hot work can commence in a zoned hazardous area or a confined space, an AGT must test the atmosphere and issue a Hot Work Permit.

The primary concern for hot work is Flammability (% LEL).

Strict LEL Limits for Hot Work:
→ Hot work is strictly prohibited if the LEL is > 0% in the immediate work area. The area must be completely clear of combustible gases.
→ The AGT must test not just the immediate work face, but the surrounding area, typically within a 15-metre radius.
→ Vapours can travel. If grinding sparks fly 10 metres and land in a drain containing heavier-than-air flammable vapour, an explosion will flash back to the source.

Continuous Monitoring during Hot Work:
Because welding generates heat, it can vaporise previously stable residues (like oil soaked into concrete, or tar coatings on the back of steel plates). A space that tested 0% LEL prior to welding can quickly become explosive as the steel heats up. Continuous LEL monitoring is required throughout the duration of the hot work.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4: RECORD KEEPING AND LEGAL LIABILITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The signature of an Authorised Gas Tester on an Entry Permit or Hot Work Permit is a legal declaration that the atmosphere was tested according to standard and is safe for workers to enter.

Every reading must be recorded accurately on the permit:
→ Do not use checkmarks (✓) or write "Safe".
→ Record the exact numerical values obtained at each level (e.g., O₂: 20.9%, LEL: 0%, H₂S: 0 ppm, CO: 0 ppm).
→ Record the time the test was taken.
→ Record the serial number of the gas detector used.
→ Sign the permit.

If an incident occurs (an explosion or a toxic exposure), the permit, the AGT's training records, and the electronic data-log downloaded directly from the gas detector's internal memory will be seized by WHS investigators. If the AGT wrote "0% LEL" on the permit, but the internal instrument log shows the detector was never turned on, or was in alarm at the time, the AGT faces severe criminal prosecution.`
    }
];
