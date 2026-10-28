

1. Ensure Admin should be able to stop  
1.  individual stage crons   
2. all stage crons  
3. An individual application stage crons  
2. Ensure that employer contact after the employer selection has been submitted and accepted (because it now matches the employer with isEmploying attribute or similar boolean attribute with true as its value; only one employer can have this attribute as true, ensure this constraint is implemented.  
   The employer contact happens in this two stages  
1. Interview mail containing zoom link and date, time etc \- sent by employer, admin fills form to and sends.

   Email is sent with the following : 

1. Operational document for the role; this document is added by the admin during job creation or edit, saved to cloudinary but when sending the email ensure the document is downloaded from cloudinary and sent as file to the applicant.  
2. Notify the applicant of the next email i.e the  onboarding process email below  to arrive in less than 2 hours  and its importance and ask applicants to ensure the read the mail and its attached file.  
2. Onboarding process email: sent as cron after interview mail has been sent \- 1hr

   With the following : 

1. Attached maca-employee-onboarding-guide.pdf file prefilled with applicants details according to the template  
2. Contact email bf  
* Strong notice should be given regarding non Australians using the Australian communication channel and vice versa, as this will resort to delay in response or no response at all.  
1. For Australian and New Zealand Residents : all.recruitment@maca.net.au  
2. For Non Australian or New Zealand Residents:  recruitement@maca.works  
3.  IT should state boldly that upon finalisation of employment and visa processing applicants must submit photocopies of all documents contained in the attached file i.e maca-employee-onboarding-guide.pdf to the human resource department using the email [hr@maca.net.au](mailto:hr@maca.net.au). Applicant should know that this step is important to initiate employee onboarding  
3. Ensure Ticket Sponsorship works properly  
1. Call/invite : email \- system-cron-sent by bluecollar mail  
2. Refund Account collection and notice of partial sponsorship by employer.  email \- system-cron(runs together with call cron above, both mails; call andRefund Account collection and notice of partial sponsorship by employer(i.e this mail) reference each other to the applicant)-sent by employer mail  
3. Application by applicant - during application remove the code on the client asking the applicant to submit bank details or wallet; the employer email in step 2 should be the one to collect this details.  
4. Acceptance \- cron with email sent from blue collar  
4. Ensure Ticket Training  works properly
1. Enrollment  
1. Mail with attached enrollment letter from rto  
2. First Applicant login  
3. AI bot API key  
4. Ai bot : ensure the bot works and that applicant can interact with it, ensure the on first login the applicant must notice the bot  
5. Ensure course syllabus can be viewed neatly  
2. Contract.  
1. Delivery \- Executed upon First Applicant login  
2. Upload of signed contract by applicant view dashboard.  
3. Submission received email  
4. Acceptance and sponsorship ID  
5. Wallet CRUD  
6. FAQ CRUD (CRUD)  
7. Invoicing (invoicing email has link for card and crypto payments; card does work and triggers crypto, screenshot for agent as confirmation, for card or crypto say time for guidance, add the agent proximity and cost and delay reduction clause, all payments should have pro and cons, crypto click also triggers crypto)  
8. Crypto Payment  
9. Receipt.  
10. Course access  
1. Ensure that the course material is downloaded from cloudinary during course display.  
2. Ensure the bot can be used to learn the course contentn  
11. Examination  
12. Partial payment completion  
13. Ticket delivery
14. employer crud