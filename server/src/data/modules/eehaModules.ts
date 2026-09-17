export const eehaModules = [
    {
        title: "Module 1: Hazardous Area Classification — Zones, Groups & Temperature",
        durationMinutes: 45,
        sequenceOrder: 1,
        contentType: 'TEXT',
        contentUrl: null,
        content: `ELECTRICAL EQUIPMENT IN HAZARDOUS AREAS (EEHA) — CLASSIFICATION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1: WHAT IS A HAZARDOUS AREA?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A Hazardous Area is defined under Australian Standard AS/NZS 60079 as an area in which an explosive atmosphere is present, or may be expected to be present, in quantities such as to require special precautions for the construction, installation, and use of electrical equipment.

The Fire Triangle dictates that for an explosion to occur, you need:
1. Fuel (Flammable Gas, Vapour, or Combustible Dust)
2. Oxygen (Air)
3. Ignition Source (Electrical spark, hot surface, static discharge, friction)

EEHA engineering is entirely focused on eliminating the third leg of the triangle: The Ignition Source. Standard electrical equipment (switches, motors, contactors) arcs and sparks during normal operation and generates heat. If standard equipment is placed in a hazardous area, an explosion is guaranteed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2: ZONAL CLASSIFICATION (PROBABILITY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hazardous areas are divided into "Zones" based on the probability and duration of an explosive atmosphere occurring. The Zones dictate exactly what type of protection technique can be used.

GAS AND VAPOUR ZONES
→ Zone 0: An area where an explosive gas atmosphere is present continuously, for long periods, or frequently (e.g., Inside a petrol storage tank). Only the highest level of protection is allowed here.
→ Zone 1: An area where an explosive gas atmosphere is likely to occur in normal operation occasionally (e.g., The area immediately surrounding the vent of a storage tank, or a pump room handling volatile solvents).
→ Zone 2: An area where an explosive gas atmosphere is NOT likely to occur in normal operation, and if it does occur, it will exist for a short period only (e.g., Outside a tank farm where a spill or pipe rupture would have to occur for gas to be present).

COMBUSTIBLE DUST ZONES
Dust explosions are often more devastating than gas explosions because of the "secondary explosion" effect (an initial small pop kicks up settled dust throughout the factory, which then detonates massively).
→ Zone 20: A place where an explosive dust cloud is present continuously, for long periods, or frequently (e.g., Inside a flour mill silo or a coal dust baghouse).
→ Zone 21: A place where an explosive dust cloud is likely to occur in normal operation occasionally.
→ Zone 22: A place where an explosive dust cloud is NOT likely to occur in normal operation, but if it does, it will only exist for a short period.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3: GAS AND DUST GROUPS (THE NATURE OF THE FUEL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Not all gases and dusts explode with the same ferocity or require the same amount of energy to ignite. Equipment must be rated for the specific group of gas or dust it will be exposed to.

GAS GROUPS (Group II - Surface Industry)
Group II is subdivided based on the Minimum Ignition Energy (MIE) and Maximum Experimental Safe Gap (MESG) of the gas.
→ Group IIA: Typical gases like Propane, Methane (surface), Petrol, and Diesel. These are the "least easily ignited" gases.
→ Group IIB: Typical gases like Ethylene and Town Gas. More easily ignited.
→ Group IIC: Typical gases like Hydrogen and Acetylene. These are the most easily ignited and most dangerous gases. Equipment rated for IIC is the most heavily engineered and can be safely used in IIA and IIB areas.

DUST GROUPS (Group III - Surface Industry)
→ Group IIIA: Combustible flyings (e.g., cotton lint, wood shavings).
→ Group IIIB: Non-conductive dust (e.g., flour, grain dust, coal dust).
→ Group IIIC: Conductive dust (e.g., magnesium dust, aluminium dust). Conductive dusts are extremely dangerous because if they settle inside an electrical enclosure, they create massive short circuits.

(Note: Group I is strictly reserved for Underground Coal Mining, focusing on Methane/Firedamp and coal dust).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4: TEMPERATURE CLASSIFICATION (T-CLASS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A spark is not required to ignite an explosive gas. If a surface (like a motor casing or a light fitting glass) gets hot enough, it will spontaneously ignite the surrounding gas. This is called the Auto-Ignition Temperature (AIT).

Every hazardous gas has an AIT. For example, Hydrogen will spontaneously ignite if it touches a surface at 560°C. Carbon Disulphide will ignite if it touches a surface at just 90°C.

Therefore, every piece of EEHA equipment is given a Temperature Class (T-Class) from T1 to T6. The T-Class states the absolute MAXIMUM surface temperature that the equipment will ever reach under worst-case fault conditions (in a 40°C ambient environment).

The T-Classes:
→ T1: Max surface temp 450°C
→ T2: Max surface temp 300°C
→ T3: Max surface temp 200°C
→ T4: Max surface temp 135°C
→ T5: Max surface temp 100°C
→ T6: Max surface temp 85°C

The Golden Rule of T-Class:
The T-Class of the equipment MUST BE LOWER than the Auto-Ignition Temperature of the gas in the area.
For example, if you are working in an area with Carbon Disulphide (AIT 90°C), you MUST use T6 equipment (max 85°C). If you use T4 equipment (max 135°C), the equipment will get too hot and cause an explosion without a single spark occurring.`
    },
    {
        title: "Module 2: Explosion Protection Techniques (Ex d, Ex e, Ex i, Ex n)",
        durationMinutes: 45,
        sequenceOrder: 2,
        contentType: 'TEXT',
        contentUrl: null,
        content: `EXPLOSION PROTECTION TECHNIQUES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1: THE "Ex" PHILOSOPHY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Because we cannot eliminate the gas (the fuel) or the air (the oxygen) in a hazardous area, we must eliminate the ignition source. This is achieved through specific, highly engineered protection techniques.

Each technique is designated by the letters "Ex" followed by a specific letter code indicating the method used.

There are three primary philosophies of protection:
1. Contain the explosion (Let it explode inside the box, but don't let it out).
2. Segregate the ignition source (Keep the gas away from the spark).
3. Limit the energy (Make the spark so weak it cannot ignite the gas).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2: CONTAINMENT — Ex d (FLAMEPROOF ENCLOSURES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Concept: We accept that gas WILL enter the enclosure, and we accept that the electrical components inside WILL spark and ignite the gas. An explosion WILL occur inside the box.

The Ex d enclosure is engineered to:
1. Withstand the immense pressure of the internal explosion without shattering.
2. Allow the hot, expanding burning gases to escape through specifically engineered "flame paths" (gaps between the flanges, or threaded joints).
3. Cool the escaping gases as they travel through the flame path, so that by the time they reach the outside atmosphere, they are too cool to ignite the surrounding explosive gas.

Critical Ex d Rules:
→ Never modify an Ex d enclosure. Drilling a new hole instantly destroys its certification.
→ Never paint over the flame path flanges. Paint changes the gap dimensions.
→ Never insert a gasket between Ex d flanges unless it is explicitly supplied and certified by the manufacturer. A gasket stops the flame from escaping, causing the box to overpressurise and explode like a bomb.
→ All bolts must be present, correct high-tensile grade, and torqued to spec. Missing one bolt compromises the flame path.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3: SEGREGATION — Ex e, Ex m, Ex p
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ex e (Increased Safety)
Concept: Ex e equipment is designed NEVER to produce an arc, spark, or high temperature in normal operation.
→ It relies on extremely high-quality insulation, guaranteed tight electrical connections (special anti-vibration terminals), and impact-resistant enclosures.
→ Because it relies on not sparking, gas is allowed to enter the enclosure.
→ Commonly used for terminal boxes and high-voltage induction motors.

Ex m (Encapsulation)
Concept: The sparking electrical components (like a solenoid coil or a small relay) are completely submerged and cast in a solid block of resin or epoxy.
→ The gas can never reach the spark because the spark is entombed in solid plastic.

Ex p (Pressurisation)
Concept: The enclosure is purged and then continuously pumped with clean, non-flammable instrument air or nitrogen to maintain a positive pressure inside the box.
→ Because the inside of the box is at a higher pressure than the outside, the hazardous gas cannot physically leak in.
→ If the pressure drops, an alarm sounds and the power is automatically tripped.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4: ENERGY LIMITATION — Ex i (INTRINSIC SAFETY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Concept: Intrinsic Safety (Ex i) limits the electrical energy in the circuit to a level so low that any spark or thermal effect produced—either in normal operation or under severe fault conditions—is completely incapable of igniting the explosive atmosphere.

How it works:
Ex i systems use a Zener Barrier or Galvanic Isolator (located in the safe, non-hazardous area) to restrict the voltage and current going out to the field instrument (located in the hazardous area).

Why Ex i is the Gold Standard:
→ It is the only protection technique permitted in Zone 0 (using Ex ia).
→ Because the energy is so low, you can perform live maintenance (calibration, wire swapping) on an Ex i instrument while the explosive gas is present, without needing a hot work permit.

Categories:
→ Ex ia: Safe with two counting faults. Allowed in Zone 0.
→ Ex ib: Safe with one counting fault. Allowed in Zone 1.
→ Ex ic: Safe in normal operation. Allowed in Zone 2.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5: THE EQUIPMENT PROTECTION LEVEL (EPL) SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Modern EEHA standards use the EPL system to define exactly where equipment can be installed, replacing the older reliance solely on the "Ex" technique code.

Gas EPLs:
→ Ga (Very High Protection): Can be installed in Zone 0, 1, or 2.
→ Gb (High Protection): Can be installed in Zone 1 or 2.
→ Gc (Enhanced Protection): Can only be installed in Zone 2.

Dust EPLs:
→ Da (Very High): Zone 20, 21, 22.
→ Db (High): Zone 21, 22.
→ Dc (Enhanced): Zone 22.

Example Label:
Ex d IIB T4 Gb
(Flameproof technique, suitable for Ethylene gas group, maximum surface temp 135°C, high protection level suitable for Zone 1 or 2).`
    },
    {
        title: "Module 3: Installation & Glanding Requirements (AS/NZS 60079.14)",
        durationMinutes: 45,
        sequenceOrder: 3,
        contentType: 'TEXT',
        contentUrl: null,
        content: `INSTALLATION & GLANDING REQUIREMENTS (AS/NZS 60079.14)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1: THE IMPORTANCE OF CABLE GLANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

In EEHA installations, the cable gland is not just a mechanical clamp to hold the cable; it is a critical, certified component of the explosion protection system. The wrong gland, or a poorly installed gland, instantly destroys the integrity of the entire enclosure.

Under AS/NZS 60079.14, you cannot use standard industrial brass or nylon glands in a hazardous area. You must use certified "Ex" glands that match or exceed the protection technique of the enclosure.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2: GLANDING FOR Ex d (FLAMEPROOF) ENCLOSURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The most rigorous glanding requirements apply to Ex d (Flameproof) enclosures because the gland forms part of the flame path. If an explosion occurs inside the Ex d box, the expanding burning gases will try to escape down the inside of the cable, between the copper cores and the outer sheath.

If this happens, the burning gas will travel down the cable and ignite the atmosphere outside, or travel straight into the main switchroom.

To prevent this, Ex d glands must be highly engineered:

1. Barrier Glands (Resin Filled):
A barrier gland is an Ex d gland where the individual copper cores of the cable are splayed apart inside the gland body, and a two-part epoxy resin or putty is packed around and between every single core.
→ When the resin sets solid, it completely blocks the inside of the cable. No gas or flame can pass through it.
→ Barrier glands are mandatory for Ex d enclosures if the enclosure is large (volume > 2 litres) and installed in a Zone 1 IIC environment, or if the cable itself is not compact (i.e., not perfectly round or filled).

2. Standard Ex d Compression Glands:
Used where barrier glands are not strictly required. They use a long, thick elastomeric sealing ring that compresses tightly against the outer sheath of the cable to form a flame path.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3: GLANDING FOR Ex e (INCREASED SAFETY) ENCLOSURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ex e enclosures do not contain explosions, so the gland does not need to be a flame path. However, Ex e relies on keeping the enclosure perfectly clean and dry to prevent tracking and sparking.

Therefore, an Ex e gland must provide a minimum Ingress Protection (IP) rating of IP54 (often IP66 in practice).
→ You must use the supplied sealing washer (nylon or fibre) between the gland and the enclosure wall to maintain the IP rating. (This is a common failure point during audits).
→ Ex e enclosures are typically plastic or stainless steel. When installing a brass gland into a plastic Ex e box, you must use a brass earth tag and locknut to ensure the armour of the cable is continuous to earth.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4: INTRINSIC SAFETY (Ex i) WIRING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ex i relies on limiting energy. If a high-voltage non-IS cable accidentally shorts out against a low-voltage IS cable, massive energy is injected into the hazardous area, bypassing the Zener barrier and causing an explosion.

To prevent this, AS/NZS 60079.14 mandates strict segregation rules for Ex i wiring:

1. Colour Coding:
Ex i cables, terminal blocks, and junction boxes should be coloured Light Blue to identify them instantly as Intrinsic Safety circuits. Non-IS cables must NOT be light blue.

2. Segregation Distance:
→ Inside a cabinet, the terminals for Ex i circuits must be separated from non-IS terminals by a minimum physical distance of 50mm, or separated by an earthed metal partition or an insulating partition.
→ In cable trays, IS and non-IS cables must be separated or a physical barrier installed between them.

3. Cable Screens and Earthing:
The shield or screen of an Ex i cable must be connected to the dedicated IS Earth at ONE END ONLY (usually in the safe area control room). If earthed at both ends, a ground loop current can flow through the shield, generating heat or sparks in the hazardous area.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5: GENERAL INSTALLATION REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cable Protection:
Cables in hazardous areas must be protected from mechanical damage. They should be heavy-duty steel wire armoured (SWA), braided, or installed in conduit. Unprotected flexible cords are severely restricted.

Earthing and Equipotential Bonding:
In a hazardous area, a static discharge spark can ignite the gas. To prevent static build-up, all exposed metal parts (pipework, vessels, structural steel, and electrical enclosures) must be heavily bonded together and tied to the main earth system. There must be no difference in electrical potential between any two pieces of metal in the area.

Aluminium Restrictions:
The use of aluminium conductors and enclosures is restricted in hazardous areas (particularly coal mining) due to the risk of "thermite" sparks. If rusty steel strikes smeared aluminium, it produces a highly energetic thermite spark that easily ignites gas. Aluminium enclosures used in surface hazardous areas must be painted or anodised to prevent this.`
    },
    {
        title: "Module 4: Inspection & Maintenance Protocols (AS/NZS 60079.17)",
        durationMinutes: 45,
        sequenceOrder: 4,
        contentType: 'TEXT',
        contentUrl: null,
        content: `INSPECTION, MAINTENANCE & DOSSIERS (AS/NZS 60079.17)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1: THE EEHA DOSSIER (THE VERIFICATION DOSSIER)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You cannot legally energise an electrical installation in a hazardous area until a Verification Dossier has been compiled and signed off. The dossier is the legal "birth certificate and medical record" for the installation.

The Dossier must contain:
→ Hazardous Area Classification drawings (showing exactly where the Zone 0, 1, and 2 boundaries are).
→ A complete equipment register listing every piece of Ex equipment.
→ The manufacturer's certificates of conformity (proving the equipment is genuinely Ex certified, typically via the IECEx scheme).
→ Calculations for Intrinsic Safety loops (proving the capacitance and inductance of the cable does not exceed the barrier limits).
→ All inspection reports (initial and periodic).

If the dossier is missing or incomplete, the installation does not comply with the law and must be shut down.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2: GRADES OF INSPECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Because EEHA equipment operates in harsh industrial environments (vibration, corrosion, heat, chemicals), it degrades over time. AS/NZS 60079.17 defines three specific grades of inspection to ensure the protection techniques remain intact.

1. VISUAL INSPECTION
An inspection that identifies, without the use of access equipment (ladders) or tools, those defects that are apparent to the eye.
→ Looking at the equipment from the ground.
→ Checking if the enclosure is physically smashed, missing, or heavily corroded.
→ Checking if the glass on a light fitting is cracked.

2. CLOSE INSPECTION
An inspection that encompasses those aspects covered by a visual inspection and, in addition, identifies those defects apparent only by the use of access equipment (e.g., elevated work platforms, ladders) and tools. It DOES NOT require the enclosure to be opened or de-energised.
→ Putting a spanner on a gland to see if it is loose.
→ Checking the tightness of external earthing bolts.
→ Examining a plastic Ex e enclosure for hairline UV cracks.
→ Measuring the gap on an Ex d flame path using feeler gauges to ensure it hasn't widened due to corrosion.

3. DETAILED INSPECTION
An inspection that encompasses those aspects covered by a close inspection and, in addition, identifies those defects apparent only by opening the enclosure. This requires the equipment to be isolated and de-energised.
→ Opening an Ex d box to check the internal threads and flange surfaces for scratches or rust.
→ Opening an Ex e box to check that all terminal screws are tight and there is no water ingress or condensation.
→ Checking that the resin in a barrier gland has cured properly.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3: PERIODIC INSPECTION FREQUENCIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every piece of EEHA equipment must undergo an Initial Detailed Inspection before it is turned on for the first time.

After that, the equipment is placed on a Periodic Inspection schedule.
→ The standard maximum interval between periodic inspections is 3 years for Close inspections, and 4 years for Detailed inspections, depending on the site's maintenance strategy.
→ In highly corrosive offshore or chemical environments, these intervals may be shortened to 6 or 12 months.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4: COMMON AUDIT FAILURES & DEADLY MISTAKES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When regulators audit EEHA installations, they consistently find the same lethal mistakes made by unqualified or complacent tradespeople:

1. Painted Ex d Flame Paths:
Maintenance crews paint a rusty Ex d enclosure without masking the flanges. The paint adds thickness to the flange, altering the meticulously engineered gap. If an internal explosion occurs, the paint burns out, creating a massive gap that allows the flame to escape and detonate the plant.

2. Scratched Flanges:
An electrician opens an Ex d enclosure. The lid is stuck, so they wedge a flathead screwdriver between the flanges to pry it open, gouging the machined steel. That scratch provides a direct, un-cooled tunnel for flame to escape during an explosion. The enclosure is ruined and must be replaced.

3. Missing Bolts:
An electrician loses one high-tensile bolt from an Ex d motor terminal box and replaces it with a standard mild-steel bolt from the hardware store, or leaves it out entirely. During an internal explosion, the mild-steel bolt stretches or snaps, the lid blows off, and the explosion escapes.

4. Silicone Sealant on Flame Paths:
An electrician notices water getting into an Ex d box and runs a bead of silicone sealant around the flange to stop the leak. During an explosion, the silicone acts as a gasket, sealing the expanding gases inside. The pressure builds until the entire enclosure detonates like a fragmentation grenade.

5. Unused Gland Entries:
A cable is removed from an enclosure, leaving an open threaded hole. The hole is plugged with a plastic dust cap or a piece of rag instead of a certified metallic Ex d blanking plug. Gas enters freely, and flame escapes freely.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5: COMPETENCY REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Because the stakes are so high, a standard A-Grade electrical licence is NOT sufficient to perform EEHA installation or maintenance.

You must hold current, nationally accredited EEHA competencies (e.g., UEE42620 Certificate IV in Hazardous Areas - Electrical, or equivalent skill sets) to install, maintain, or inspect this equipment. Operating outside these competencies places the entire facility at risk of a catastrophic explosion.`
    }
];
