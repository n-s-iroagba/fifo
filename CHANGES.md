# IMPLEMENTATION RULES

 When implementing all the ‘IMPLEMENTATION PROMPTS’ below for each execution make sure the following rules are adhered to.

1. Do not  use useless, ai-like words for user facing text. Use a simple corporate communication style with zero filler or buzz words.  
2. Every implementation of the prompts must build and keep the following:  
1. Trust  
2. Clarity with zero jargon  
3. Aesthetics :   
* use simple but not nice aesthetics, do not use colors or icons where there’s no need.  
* Any documents or email sent from RTO

  must borrow theme from [certherof.com](https://certhero.com.au)

* Keep coloring simple, do not throw colors all over the place

# IMPLEMENTATION PROMPTS

EDITS

1. ALL EMAILS LISTED AS HEADINGS MUST BE IMPLEMENTED   
2. MARKETING AID: On the registration form consent to making a testimonial video if hired.  
3. Add the following to the applicant model attributes  
1. interview date.  
2. Interview time  
3. Interview link.  
4. Ensure that the following are saved for email as env variables,   
1. Info(blue collar)  
2. RTOInfo  
3. Employer  
4. Email from admin and server can be sent from any of the three servers above.  
5. Ensure that the changes below are completely and properly implemented.  
1. Create a JoblistingEmployer junction model.  
* Attributes  
1. Employer Id  
2. Joblisting I'd  
3. vacancy url (can exist as null)  
2. Implement these relationships  :   
1. Joblisting has many potential employers, potential employers have many JobListing; using the JoblistingEmployer table created in (5.1) above.  
2. Application has only one joblisting; joblisting has have many applications   
3. Applicant has only one application; application has only one applicant.  
4. TicketCatalogue has many tickets; tickets have only one ticket catalogue.  
5. JobListing has many TicketCatalogue; TicketCatalogue has many JobListing.  
6. Application has only one JobListing: JobListing has many applications  
7. Applicants has many tickets; tickets has only one applicant.  
* When an applicant is applying, all of the JobListing ticket catalogue of the application being created is copied as the applicant’s tickets.  
* Admin can CRUD (from existing ticket catalogues on the. db)applicant's ticket 


3. Create a page to fetch and update vacancy urls of each item in the JoblistingEmployer Table.  
4. Add operational manual link to the to Job listing model  
5. Add a file field for the operational manual to the Job listing create and update form on the client; on upload, save to cloudinary.  
1. On create or update operational manual should saved in cloudinary  
2. Admin should see the operational manual when they need to.  
6. Operational manual is sent as file; not link when sending interview notification email.  
7. On Creating or updating a joblisting, at least one employer must be selected.  
1. On the job listing form, admin must leave at least one employer checked (can be more than one)  
2. Admin must enter a vacancyUrl for all checked employers during creation or newly checked employers during update.  
3. Admin must enter vacancyUrl for all checked employers during creation.  
4. Admin edit vacancyUrl for all checked employers during update.  
5. VacancyUrl is used to create or update rows on the JoblistingEmployer table created in 4.1 above.  
8. Edit ticket courses model:  
1. to have course content url,  
2. remove text content attribute,   
9. For the employer model, add   
1. website URL.  
2. company description  
10. Admin must include zoom link before sending interview notification email; the email must be sent from the employer mail  
11. Employer Selection Invite Email: For each application, for employers associated with the application’s joblisting  
1. The vacancy url exists,i.e JoblistingEmployer.vacancyUrl \!==null( null is default state), it shall be included in the Employer Selection Invite Email sent to the applicant, to build legitimacy and trust.  
2. employer.company description   
3. employer.websiteUrl  
12. Each Ticket Course should have a syllabus attribute.  
13. And website link on the following  
1. Employer model   
2. On Employer Selection form email all the employer website links should be displayed for verification.  
6. Seed database

1. Fetch operational manual for each job listing from the web as a file i.e any documents that details the knowledge and operational procedures of each job on a mining site.  
2. Edit job listing seed file, FIFO.csv data to match JobListing model.  
1. The benefit column should be written in a numbered manner so that client side formatting can display it as a bullet list.  
3. Seed Employer as Maca Limited and Mineral Resources to match employer model.  
4. Fetch all tickets for each job listing in Perth Western Australia and create a JSON or txt file( based agent preference) for each job and all tickets required called ticketsRequirement.json/txt.  
* The search should only include tickets and drivers license, no police clearance  
* The object notation of each ticket in the file should match the TicketCatalogue Model.  
* There should be columns of each requirement to show if its course, exam questions and the catalogue have been seeded  
5. For each ticket search and download training manual from the web.  
* Ensure that all manuals have a table of content i.e syllabus.  
* ai extracts the syllabus, extracts the text in the manual and recreates them using cerhero branding ( https\://[certhero.com.au](http://certhero.com.au) )  
* Be sure to link the ticket to rebranded manual

  Course Model:

  Attributes for mutilation (seeding data must adhere to):

> > > > > > 1. Remove content text  
> > > > > > 2. Create content URL  
> > > > > > 3. Create  syllabus attribute should be compatible with the template format prepared in e below.

   

6. Prepare course syllabus  
* Create a template text or Json format for the syllabus to ensure uniform formatting on the front-end  
* Save each syllabus created in the template format in a file, linked to their tickets


7. Prepare examination questions  
* For each ticket training material, draft out 35 examination questions and save them in JSON files, each linked to the ticket.  
8. Seed job  
* With operational manual saved in cloudinary  
9. Seed Ticket Catalogue   
* Save TicketCatalogue  
* For each TicketCatalogue :   
1. Seed

   Course Model:

> > > > > > 4. Save rebrandedtraining material to cloudinary and provide public url  
> > > > > > 5. use content URL  
> > > > > > 6. Use syllabus  with the template format prepared in e.  
2. Seed the exam questions based

   course material and syllabus.

3. Update the TicketRequirements.json file 

7. PSYCHOMETRIC MODULE 2  
1. When navigating to rto, A modal should pop up, the aim of the modal is to route as if in australia or not, if in australia routes to [https\://certhero.com.au](https://certhero.com.au), if not routes to rto url add this text to the message also : course access on this is only for sponsored overseas candidates use main portal  
2. Before the applicant can start the module, a pop shall be displayed to confirm if the applicant has read the \`HIRING\_PROCESS\_INFORMATION.pdf\`file attached to the welcome mail.  
3. If the answer to the question asked by the modal above is no applicants are made to download the file immediately.  
4. Rewrite the psychometric module 2 questions to be based of the \`HIRING\_PROCESS\_INFORMATION.pdf\` document with concentration  
* SECTION 1  
* SECTION 2 (refund policy questions should not be included).  
8. Application accepted should be manual with mandatory email sent alongside by admin.  
1. Change application acceptance from crown to manual via admin dashboard.  
2. For an admin to accept an application, the admin must also draft the mail to be sent to the applicant for notification.  
9.  Move invoice and receipt generation to the server.  
10. Remove partial pay  
11. Rename everything in client and server with the word aveling to Rto  
12. Unify RTO credentials creation and management.  
13. Visa sponsorship Employer official list   
1. Rename “NOMINATION OFFICIAL SPONSOR LIST” to Official Sponsor Employers list.  
2. Nomination should be renamed to Employer Selection on the client and server app. This includes  
1. Forms  
2. Model  
3. Email  
4. UI  
3. The applicant should be able to view the official visa sponsorship Australian companies  
* Add this link when sending mail just after admin creates initiates employer selection for applicant:  https\://www\.workvisalawyers.com.au/images/Approved-Sponsor-List-2025.pdf 

  to the create initial email and and prompt them to click it and check if the companies in the employer form are on the official visa sponsor list (notify the applicants that the most recent was released in 2025 against 2026\)


  	

FEATURES  
F001

* ATS CV parsing  
  ACTIONS  
* CVA01  
* Applicant uploads CV  
* STEPS  
* CVS01  
> > > > > > *  System checks if CV uploaded is ATS format  
* CVS02  
> > > > > > * System checks for grammar.  
> > > > > > * IMPLEMENTATION NOTE : non English names and company names under experience should not be checked.  
* CVS03  
> > > > > > * if CVS01 or CVS02 fails, user is prompted to either down at template if CVS01 fails and check grammar if CVS02 fails  
*  CVS04  
> > > > > > * The system saves parsed data to the database in applicant qualification and experience tables  
* CVS05  
> > > > > > * On success applicants are notified.  
> > > > > > * On error applicants are notified.  
> > > > > > * Employer Selection

F002

* Qualifications upload  
  ACTIONS  
* QAA01  
* Qualifications certs upload.  
* STEPS  
* QAAS01  
> > > > > > *  If CVS05 is successful and the applicant has applicant qualifications, the system fetches the applicant qualifications.  
* QAAS02  
> > > > > > * After QAAS01,  
> > > > > > * system shows an interface with a file field for each qualifications upload and qualification name as the labels  
* QAAS03  
> > > > > > * Applicant 

  uploads one or more certificates for qualification.

> > > > > > * IMPLEMENTATION NOTE : applicant is only mandated to upload one if qualifications are 2 or more but if 1 or none, then applicants are free to upload none.  
*  QAAS04  
> > > > > > * Qualifications are saved to applicant qualification model.  
> > > > > > * UI reacts based on success or failure.

F003

* Bio update  
  ACTIONS  
* BUA01  
* Bio update.  
* STEPS  
* BUAS01  
> > > > > > *  Applicant fills their bio details  
* BUA02  
> > > > > > * The system checks that all fields are filled and meet a minimum character count criteria.  
* BUA03  
> > > > > > * On success applicants are notified.  
> > > > > > * On error applicants are notified

F004

* Employer Selection  
  ACTIONS  
*   
* ESA01  
* Employer selection  
* STEPS  
* ESAS01  
* Stage Update : Employer Selection \- Ongoing.  
* Call for employer selection.

   24 hours after application has been accepted, system cron sends employer selection invite mail.

* Implementation notes  
> > > > > > 1. The system fetches the employers from the backend.  
> > > > > > 2. The vacancy position should the the applicants joblisting title  
> > > > > > 3. System fixes a random number of applicants from integers 2 to 7 as the number of slots/vacancies for each company in a tabular form.  
> > > > > > 4. For the total vacancies system adds 2 to the number and displays it as the total applicant pool.

   

* ESS02

  Applicant receives mail from ESAS01, applicants just before ESAS03 upload, checks the box for their choice of employer.


* ESAS03

  Applicant receives mail from ESAS01, downloads document signs and uploads it using their dashboard 


* ESAS04

  If the applicant selected employer is not the employer marked as “is currently employing” in EMS02, System sends a change of employer's selection mail to applicants

* ESA02  
* Employer selection change  
* STEPS  
* ESAS05

  Call for employer selection change.

  If the applicant selected employer is not the employer marked as “is currently employing” in EMS02, System sends a change of employer's selection mail to applicants


* ESA03  
* Employer selection Acceptance  
* STEPS  
* Stage Update \- Employer Selection \- Completed  
* ESAS06  
* Employer selection acceptance.

  5 hours after submission a crib job runs

  If selection now matches the employer marked as “is currently employing” in EMS02, employer.

  And acceptance of employer choice mail is sent from info(blue collar). 


F005

* Employer notification of application acceptance   
  ACTIONS  
* INA01

  Conditional Invitation for interview

* STEPS  
* INAS01

  Admin selects applicant from dropdown

> > > > > > 1. Admin fills in interview details e.g date time and timezone  
> > > > > > 2. Admin adds zoom link  
> > > > > > 3. Request is sent to the server  
> > > > > > 4. applicant.interviewDate, applicant.interviewLink, applicant.interviewtime is updated on the server on to the dB.  
> > > > > > 5. Email from employer mail  is dispatched to applicant with the following:   
> > > > > > 1. Interview link  
> > > > > > 2. Interview date  
> > > > > > 3. Interview time  
> > > > > > 4. joblisting operational material (on the joblisting model)

   

   

* INA02  
* 1 hour after INAS01 is executed, the employerSecondContact email should be sent from Employer mail.

  This email aims. to educate the applicant on the interview to onboarding steps, which have outlined properly in the attached file \-  maca-employee-onboarding-guide.pdf

* maca-employee-onboarding-guide.pdf is created at the server.  
> > > > > > 1. Append Applicant name:  
> > > > > > 2. Append Applicant interview date

   

F006

* Employer Management  
  ACTIONS  
* CRUD only one employer can be marked as “is employing”

F007

* Ticket Sponsorship   
  ACTIONS  
* TSA01

   Invite for sponsorship.

* STEPS  
* TSAS01 : 

  3 hours after notification of interview by blue collar in F002 above, a crown job sends the applicant and email of invitation to upload tickets and/or apply for sponsorship for training to fill certification gaps.


* TSAS02:

  On receiving the mail applicants visit their dashboard and upload any tickets they possess.


* TSAS03 : 

  if no tickets, or gaps exist i.e incomplete possession, applicants are encouraged by the UI to apply for sponsorship.

* TSAS04 :

  6 hours after the sponsorship application, a sponsorship application is approved on the server to update DB and an email is sent to the applicant.

F008

* NAME : CertHero Enrollment   
  ACTIONS  
* CEA01 : Notification of Applicant on Enrollment with CertHero  
* STEPS  
* CEAS01 : 

  6 hours after ESA04 step has been executed, 

> > > > > > 1. Certhero

   credentials are created via cron job on the server,

> > > > > > 2. The letter of enrollment draft is prefilled with Applicant details, and ticket courses of enrollment as it should be in a real training institute.  
> > > > > > 3. Applicant cert hero credentials and applicants enrollment letter are sent in an email and the applicant is asked to login to their certhero portal and get acquainted with the syllabus.

   The email shall also state upon completion of enrollment applicants will be given access to the ai tutor to fastrack their learning.

> > > > > > 4. And the minimum duration for the enrollment as failures to commence and complete courses and their examinations before the deadline date will lead to forfeiture of the opportunity.  
> > > > > > 5. Enrollment email containing all above is sent from Rto Email.  
* CEAS02 : 

  Upon login from CEAS01 by applicant on Rto site

> > > > > > 1. The selected Employer sends a mail (from employer email) asking the applicant to submit an international means of receiving refunds if any before the end 3 weeks.And refund policy on any financial responsibility borne by the applicant in the course of being trained.  
> > > > > > 2. The mail asks them to keep an eye for the blue collar contract for ticket sponsorship mail, if not received.  
* CEAS03 : On first login to the portal ai bot must pop up and mandate that  the applicant either asks a question or picks for any questions from.the premade options using their exact role of ticket course combination for their role.


* CEAS03:

  On receiving the mail applicants login their certhero portal.The login request hits the server, and the following are carried out

> > > > > > 1. Applicant ticket sponsorship contract is drafted using the template with applicant bio details and ticket gaps.  
> > > > > > 2. The stage is updated  
> > > > > > 3. Email is sent to the applicant from blue collar with the contract.  
> > > > > > 1. The mail asks them to keep an eye on their mail as their employer shall ask for their bank account for refund purposes.  
> > > > > > 2. Applicants are asked to fill and sign the contract and upload it on their dashboard to obtain the sponsorship ID.  
> > > > > > 3. Upon upload of the contract applicants are told the contract ID will be sent in 3 hours  
> > > > > > 4. 2 hours after upload a crib job runs to send sponsorship ID

   d.On dashboard applicant can see course syllabus but no not the content till they 

   pay,

    Attempting to take the course triggers a question: "Are you a sponsored candidate?

   e. If yes, the system requests the sponsorship ID.

   f. user enters sponsorship ID and it's checked on the backend.

   g. After sponsorship ID entry user is navigated to the invoice request page or when they click they attempt to take the course again.

*  CEAS04 :  
> > > > > > 1. proceeding from CEAS03 c.Applicant goes to their CertHero dashboard and enters their contract id, which navigates them to the invoice request page showing  the applicant.percentageSubsidy and the amount in AUD, 

   The reason for payment message is displayed with wording and tone that reflect that based on the contract with the selected employer and their partner labour hire company the residual refundable cost borne by the applicant is to ensure the applicant completes the courses, takes the examination without dropping out.

> > > > > > 2. The 100% refund policy on upon ticket acquistion by employer  
* CEAS04 : Applicant is prompted to request an invoice and applicant is a show the refund policy with the request invoice button below the refund policy  
> > > > > > 3. Applicant hits the request invoice button.

F009

* NAME : PAYMENTS  
  ACTIONS  
* PA01  
* NAME: Invoicing  
* STEPS  
* PSAS01 : Once Applicant executes CEAS05(c )

  The following happen

> > > > > > 1. An invoice object is created for the applicant.  
> > > > > > 2. Using the invoice template and total ticket costs a certHero (using the design theme at [https\://certhero.com.au](https://certhero.com.au)) invoice is prepared.  
> > > > > > 3. The invoice email is sent with payment instructions from Rto Email.

   For the following means of payment, each has its rules, refund means, processing time as it affects when applicants can start the courses and a top level boldly written refund policy.

> > > > > > 1. Wire transfer for Above AUD  
> > > > > > 2. Agent wire transfer  for less the 700AUD (if an agent bank account; created in PA04, exists in the database)  
> > > > > > 3. Card   
> > > > > > 4. Crypto via bitget. Play store and apple links to download bitget wallet and the crypto faq link to address their concerns.  
* PSAS02:   
> > > > > > 1. To proceed with card payments a pay with card button is displayed in the email that navigates to the card payment page.  
> > > > > > 2. To pay, a button is also displayed that navigates to crypto payments.  
* PA02  
* NAME: Card payment  
* STEPS

  mail 

* PCAS02 : 

  On getting the card payment page as standard but dummy card details collection page is displayed after user inputs details, the following happen

> > > > > > 1. On clicking the pay button the user is alerted that card payments are not

    allowed in their country for this merchant 

> > > > > > 2. In the same line as a. above, an email is sent to the applicant from CertHero finance team to use another pay method.

   And that if speed matters they should use the bitgwt crypto method as it is quick and easier than expected and have should have no fears as CertHero has publicly viewable wallet addresses and with bitget platform and disputes are sure to handled amicably and then refer them to Ian for more enquiry.

* PA03  
* NAME: Precondition: On navigation to the crypto payment route  
* STEPS  
* PA03S01 : 

  User sees a clickable and scannable qr code made from the admin wallet string saved in the database

  Only one wallet can be in the database per time

* PA03S02:

  user sees scanning instructions for the following scenarios with their phones if on pc or click instructions if on mobile

* PA03S03 : 

  on click or on scan, if the bitget wallet is installed on the device it opens the bitget wallet and balance f not installed it opens play store or Apple store based of on os

* PA03S04 :

  Applicant views Payment instructions 

* PA04

  CRUD AGENT BANK ACCOUNT

1. Bank account for swift international wire transfer  
2. Create Model  
3. Only one entry should exist on the database.  
4. Create the admin client CRUD UI.  
5. Implement CRUD on the server.  
* PA05  
* Receipts  
* STEPS  
* PA04S01:

  On admin navigation to the pending payments page, the system fetches all applicants with an unpaid invoice and those with a half paid invoice.

* PA04S02 :

  Admin selects the applicant, enters the amount  paid and sends the request to the server.  

* PA04S03:

  System fetches the invoice makes it as paid

* PA04S04 : 

  The system creates a receipt document.

* PA03S05 :

  system sends the receipt document via email.


F010

* NAME : COURSE ACCESS  
  ACTIONS  
* CA01  
* Syllabus, Course and Examination Questions   
* STEPS  
* CAS01 :

   Developer provides pdf manual for each ticket, CAS02 : 

  .

* CA02  
* Course consumption  
* STEPS  
* CAS02 : 

  If applicant has paid their invoice, the can view the course as a non downloadable branded manual document on their screen, the ai bot should display and the user can interact with it based on the document in display or other manuals for other tickets.

* PA03S02:

  user sees scanning instructions for the following scenarios with their phones if on pc or click instructions if on mobile

   

* CA03  
* Examination   
* STEPS  
* CA03S01 :

  If invoice has been fully paid, 

  applicants can take the exam anytime they wish, exams are graded immediately. 

  If the invoice has been half paid, applicants can only take 3 examinations, an attempt to take the fourth should ask them if they are paying with bank transfer or crypto. Note each of the payment pages above should contain links to route to the other.

* CA03S02:

  If applicant passes, the exam a system sends a congratulatory message and then creates ticket from branded template and sends tickets via email after 3 hours

* CA04S03 : 

  If a candidate actually fails on a second attempt the applicant should be automatically passed at the 60% pass mark and step CA04S02 executed. If a candidate fails the first attempt of a ticket course they should be encouraged to try again and shown the questions they got wrong and an email should be sent.

* CA04S04 :

  system sends the receipt document via email.

* CA04  
* Handoff  
* STEPS  
* CA04S01 :

  After the applicant completes the last ticket exam, passes and  receives their ticket, 6 hours after that, blue collar sends a notice of Handoff telling them their employer shall be in contact with them and they shall be off boarded from the platform in a few hours after employer contact.

F011 \- Crypto Wallet CRUD

* Create UI  
* Server Implementation   
* Only one USDT Crypto wallet is stored per time on the DB

DOCUMENTS

1. HIRING\_PROCESS\_INFORMATION  
2. EMPLOYER SELECTION FORM (DERIVED BY RENAMING NAMING NOMINATION FORM)  
3. CERT HERO ENROLLMENT LETTER  
4. SPONSORSHIP CONTRACT  
5. INVOICE  
6. RECEIPT  
7. TICKETS

1. RENAME NOMINATION FORM TO EMPLOYER SELECTION FORM  
2. MOVE FORM CREATION TO SERVER

   Create an enrollment letter using styling theme on certhero.com.au as demo to be sent in 

1. Fetch applicants tickets with not-possessed attribute.  
2. Outline the tickets, with mode of instruction table (online Vs practical)  
3. Online procedure  
4. Practical procedure  
5. Communication channel  
6. Deadline section  
1. Examination completion with a pass for all assigned ticket courses deadline  : 16 days from date of enrollment the date the mail was dispatched 

1. THIS IS SIMILAR TO THE EMPLOYER SELECTION FORM, HOWEVER ONLY THE EMPLOYER, WITH ISEMPLOYING FLAG TRUE IS SENT

1. Edit contract  
1. Move contract creation to the server.  
2. State body that it is not an employment contract; this is to ensure you get a job if you meet the requirements, what the means of or the applicant.  
3. Amount in AUD  
4. Refunder and refund policy.  
5. remove accomodation and other visa related stuff  
6. List what the employer is to cover in the employment contract.  
1. Skills assessment   
2. Medical   
3. Visa costs and sponsorship   
4. Flight  
5. Accommodation off-site (3 months) and on-site (through duration of employment contract)

1. Move invoice generation to the server.

1. Sequence is as follows  
1. Onboarding \- sign-up verify email (already fully implemented)  
2. Application \- commenced with welcome email.  
3. Employer selection  
4. Interview scheduling.  
5. Ticket Sponsorship: invited\| applied\| application approved \| contract.  
6. Tickets’ acquisition.  
7. Handoff  
2. Each approval email should state the effect in terms of hiring procedures and the next step  
3. Each commencement email e.g welcome email, should clearly state aim of the stage, the reason behind the aim as regarding being hired(under “how does this help me get hired) the procedure, consequences of lateness or non compliance (as the case maybe),  
   And communication channel and expected time of response for each applicant.  
   Start from psychometric test module 1 after passing.  
     
     
1. Welcome email  
2. Psychometric module 1 mail  
3. Psychometric module 2 mail  
4. Application submitted mail.  
5. Application accepted mail.  
6. Employer selection mail  
* ID :M06  
* FUNCTION NAME :send  
* EMOTIONAL GOAL  
* ATTACHMENTS: Employer Selection form  
* CONTENT  
1.   
7. Employer selection filled mail.  
8. Employer selection Accepted mail.  
1. The employer shall be in contact with you via mai.

   \*\*\*Employer should as them to download zoom for interview, in fact interview link is sent. to the applicant.

9. Notification of interview date and time mail.  
10. Call for ticket sponsorship mail.  
11. Ticket sponsorship accepted mail.  
12. Ticket courses enrollment mail.  
13. Contract delivery mail.  
14. Contract agreement acknowledgement mail (contracted dispatch)  
15. Invoice mail  
16. Receipt mail  
17. Ticket pass mail  
18. Ticket fail mail  
19. Ticket delivery mail.  
20. Ticket drop off mail.  
21. Handoff mail.

1. CV should be in ats format.

On passing psychometric module 1 based of hiring\_process\_information.pdf, applicant should be congratulated for being eligible to be sponsored at least in part for their ticket training.

1. Make the application approved mail specific to the following   
1. Experience  
2. Job role applied for.  
3. Qualifications  
4. And also inform them about the employer selection stage to which a mail to the effect shall be sent in 24 hours.

1. Agreed to be enrolled notice.  
   Add following clauses to the mail  
1. State clearly being medically fit and passing the ticket examinations are the only guarantee to getting hired by our client companies.  
2. WHY ARE TICKETS REQUIRED

   NOTE: MOST OVERSEAS APPLICANT DO NOT HAVE ALL TICKETS REQUIRED TO WORK IN AUSTRALIA EVEN IF EXPERIENCED

2. 

Email Should contain: Officially enrolled, enrollment details will be sent by partner RTO.

1. Credentials  
2. View syllabus  
3. View the course outline and ai tutor shall be provided to guide you through difficultty in mail and ui

1. Email should contain:

   

1. Minimum amount for each route.  
2. Discount policy   
3. Half payment note for only card and crypto routes.  
4. Refund policy  
5. faq (link all encompassing all means (addressing possibilities, traceability, refund, speed and legitimacy of means).  
6. \- Payment Link or details and instructions,

   \- means of refund

   \- and minimum amount alongside the following.

1. Card  
> > > > > > 1.   
> > > > > > 2. Pros \- Instant, easy  
> > > > > > 3. Cons \- payment processor not available in all countries   
> > > > > > 4. Means of refund \-   
> > > > > > 5.   
2. Direct wire  
> > > > > > 1. Cons \- only for payments above 1000 AUD, high cost delay  
> > > > > > 2. Means of refund

   

3. Cryptocurrency gateway  
> > > > > > 1. Pros \- Instant, company uses a tracable means via bitget.  
> > > > > > 2. Cons \-    
> > > > > > 3. Means of refund  
4. Closest Agent  
> > > > > > 1. Pros \- Any amount    
> > > > > > 2. Cons \- high cost, delay   
> > > > > > 3. Means of refund

The crypto option mail:   
The aim of this email is to calm the nerves applicants that fear crypto payments due to complexity   
AI IMPLEMENTATION NOTE: Clearly explain to the them in the mail why it is safe and why my method using bitget is safe and easy.  
Email has the the following  
Operational manual attached to the job listing; server downloads it from cloudinary and attached the file to the email as the interview preparatory material.  
Zoom link to the interview meeting  
Interview date and time.  
  

Notification on post employment visa processing produce and onboarding process (sent beforehand, applicants should be sure of medical and other fitness, sent as a preventive measure for applicant, so they don't proceed to get tickets while being unfit for the role)  Employment contract with clear terms (salary, hours, etc.).  
  · Interview date already set.  
  · Promised steps from interview to onboarding: TRN, nomination, visa, TRA skills assessment, arrival, start date. These are promises, not actual events.  
Reply with selected interview date and a zoom link will be sent

1. Add operations manual attribute to the joblisting model, during mutilation or creation, the operations manual is saved in cloudinary.

1. Current bank account model should server as agent bank account  
2. There should be only one agent bank account on the system

1. Create wallet model with the following attributes  
1. Address  
* Only one wallet in db  
* Wallet is a USDT tron network

Create Employers model

1. Create ApplicantQualification Model.

1. Create Experience model, based off ats CV standards.

1. Applicant only have one invoice 1:1  
2. Remove invoice type attribute  
3. A receipt is generated if the invoice is marked as paid, and sent via mail  
4. Invoice can be unpaid or half paid or paid

