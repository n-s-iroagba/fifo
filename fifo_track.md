1. # Job search Public Page

* Steps:  
1. View job list  
2. View particular job details  
3. Click apply

     

* Conditions   
1. Found  
1. Not Signed in  
1. Registered 

   Login

   Redirect to job details page (dashboard)

2. Not Registered   
> > > > > > 1. Signup  
> > > > > > 2. verify email redirect link to job details page(dashboard)  
> > > > > > 3. Update Stage ( (name: Application, status: Not Started)  
> > > > > > 4. Send welcomeEmail  
2. Signed in  
1. Update BIO  
> > > > > > 1. Update Bio  
> > > > > > 2. Update Stage (name: Application, status: Bio Updated)  
> > > > > > 3. Send Bio updated Mail  
2. Take Psychometric Module 1  
> > > > > > 1. Automatic pass at grade on submission   
> > > > > > 2. Update Stage (name: Application, status: Psychometric Test Module 1 passed)  
> > > > > > 3. Send PyschometricModule1 passed mail  
3. Take psychometric Module 2  
> > > > > > 1. On Submit  
> > > > > > 1. Send PsychometricModule2 pending review mail  
> > > > > > 2. Update Psychometric module 2 for candidate as under review  
> > > > > > 3. Update Stage (name: Application, status: Psychometric Test Module 2 under-review)  
> > > > > > 2. On Admin Approval  
> > > > > > 1. Update Psychometric module 2 for candidate as passed  
> > > > > > 2. Send Psychometric Module 2 passed email  
> > > > > > 3. Update Stage (name: Application, status: Psychometric Test Module 2 passed)

   > > > > > > 

4. Upload CV  
> > > > > > 1. Upload CV  
> > > > > > 2. Send CV uploaded mail  
> > > > > > 3. Update Stage (name: Application, status: Cv uploaded)

   

2. Not Found  
1. Not Signed in  
1. Registered   
> > > > > > 1. Login  
> > > > > > 2. Redirect to expression of interest page (dashboard)  
> > > > > > 3. Send How to express interest mail  
2. Not Registered   
> > > > > > 1. Signup  
> > > > > > 2. verify email redirect link  to expression of interest page 

2. # Job search Dashboard

* Steps:  
1. View job list  
2. View particular job details  
3. Click apply

     

* Conditions   
1. Not Found  
1. Signed in  
1. Fill Form  
> > > > > > 1. On submit  
> > > > > > 1. Receive ExpressionOfInterestRecievedMail  
> > > > > > 2. On Approval By Admin  
> > > > > > 1. Admin selects joblist and selects applicant  
> > > > > > 2. On Admin Approve, applicant receives vacancy AvailableMail  
2. Found  
1. Signed in

   

1. Take Psychometric Module 1  
> > > > > > 1. Automatic pass at grade on submission   
> > > > > > 2. Update Stage (name: Application, status: Psychometric Test Module 1 passed)  
> > > > > > 3. Send PyschometricModule1 passed mail  
2.   Take psychometric Module 2  
> > > > > > 1. On Submit:  
> > > > > > 1. Update Psychometric module 2 for candidate as under review  
> > > > > > 2. Send PsychometricModule2 pending review mail  
> > > > > > 3. Update Stage (name: Application, status: Psychometric Test Module 2 under-review)  
> > > > > > 2. On Admin Approval  
> > > > > > 1. Update Psychometric module 2 for candidate as passed  
> > > > > > 2. Update Stage (name: Application, status: Psychometric Test Module 2 passed)  
> > > > > > 3. Send Psychometric Module 2 passed email

   > > > > > > 

3.    Upload CV  
> > > > > > 1. Upload CV  
> > > > > > 2. Update Stage (name: Application, status: Cv uploaded)  
> > > > > > 3. Send CV uploaded mail

4. Update BIO  
> > > > > > 1. Update Bio  
> > > > > > 2. Update Stage (name: Application, status: Bio Updated)  
> > > > > > 3. Send Bio updated Mail

3. # Application Submission

* Steps  
1. After completing any one of two above, user clicks button to apply for job  
2. Job Tickets copied as applicant tickets (gaps).  
3. Automatic Application Received Awaiting Review mail is sent  
4. Stage Update (name: Application, status: under-review)  
5. After 6hrs cron job  
1. Application is marked as Accepted(stage.status)  
2. Application Accepted Mail is Sent.  
* 


4. # Nomination

* Steps  
1. Admin selects applicant from a drop down  
2. Admin sees the applicants applications  
3. Admin total number of applicants  
4. Admin enters one or more   
1. Company  
2. Role  
3. Vacancy numbers  
5. Admin can preview document created  
6. Applicant nomination tables are created in the server  
7. Stage Update (name: Nomination, status: on-going)  
8. A Nomination document is sent alongside a mail(NominationPresentationMail)  
9. Applicant downloads document and signs  
10. Applicants visit nomination page in dashboard  
11. Applicant views their nominations  
12. Applicant checks (check box) their selected nomination  
13. Applicant uploads Signed nomination  
14. Stage update (name: Nomination, status: under-review  
15. Admin approves nomination  
1. Selected nomination marked  
2. NominationApprovedMailSent  
3. Stage update(name: Nomination, status: completed)  
16. Applicant view nomination as selected(no changes can be made)  
17. Admin rejects nomination  
1. Nomination Rejected Mail is sent  
2. Applicant continues from step 12 \-16 above

   

5. # Ticket Uploads And Sponsorship Application

1. 1 hour after Nomination Step 15 above  Ticket Uploads And Sponsorship Application Mail is sent  
2. Applicant visits tickets dashboard, uploads none or more tickets and applies for sponsorship for the ones with no uploads.  
3. Upload tickets are marked as possessed  
4. Applicant receives mail confirming sponsorship application review  
5. Stage update (name: TicketSponsorship, status: under-review)  
6. Admin edits applicant.subsidyPercentage attribute (optional should not block g below, and should be edited on the applicants details page)  
7. 2 hours after ticket sponsorship application submission  
1. Cron job approves application  
2. Ticket Sponsorship Approval Mail is sent  
3. Stage Update (name : Ticket Sponsorship: approved)

 


6. # Contract

1. Admin selects candidate from drop Applicant ticket gaps (tickets not possessed),  
2. Applicants details and subsidyPercentage (visa is free),  and selected  nomination are used to fill in the contract template.  
3. Admin can preview.  
4. Mail is sent with the document (ContractPresentationMail)  
5. Stage update (name: Contract, status:ongoing)  
6. Applicants visit contract page in dashboard  
7. Applicant uploads Signed contract page 1 and page 15 or only page 15 (2 different upload tags)  
8. Stage update (name: Contract, status: under-review)  
9. 3 hours after upload by Cron job  
4. Contract marked as approved  
5. Contract ApprovedMailSent  
6. Stage update(name: Contract, status: completed)  
10. Applicants can view their contract as approved and can still upload page 1 if required.

7. # Payment Confirmation

1. Mail is sent manually  admin via template(create the template, template should be prepopulated with applicants name and details), the mail is to confirm if making half payments on their total ticket bundle or full payment at a 10% discount.

8. # Invoicing

* Type  
1. Partial  
2. Complete-after-partial  
3. Complete  
4. Shipping  
5. Visa  
* Steps  
1. Select Applicant from dropdown  
2. Select type  
3. Select Wallet  
4. Preview  
5. Systems apply rules  
6. Create invoice at the server  
7. Send with email as attachment  
* Rules  
1. Partial  
   1. Prefill  
   2. Note as partial ticket courses and certification payment  
   3. Invoicer : Aveling  
   4. Mail: Aveling  
2. Complete-after-partial  
   1. Prefill  
   2. Note a completion of partial ticket courses and certification payment.  
   3. Invoicer : Aveling  
   4. Mail: Aveling  
   3. Complete  
   1. Prefill  
   2. Apply 10% discount  
   3. Note a completion of partial ticket courses and certification payment.  
   4. Invoicer : Aveling  
   5. Mail: Aveling

   

4. Shipping  
   1. Prefill (Ticket shipping fee).  
   2. Invoicer : Aveling  
   3. Mail: Aveling

   

5. Visa   
   1. Prefill(Visa Fee Subsidy).  
   2. Invoicer : Aveling  
   3. Mail: Aveling  
* 

9. # Receipt

   1. Fetch invoices from server  
   2. Select invoice from dropdown  
   3. Generate receipt  
   4. Preview  
   5. Create at server  
   6. Send with mail as attachment(all files are sent with mail as attachment)

   

10. # Aveling Credentials

   1. Go to applicant applicants details page  
   2. Create credentials automatically  
   3. Save to database  
   4. Send via email (Aveling)

11. # Ticket Courses

* All Mails are sent by aveling  
1. Ticket Courses, Catalogue And Exam questions are seeded by the developer  
2. If aveling partial made with no complete after partial invoice paid, applicant can only take 3 ticket courses and exams.  
3. If complete after partial payment made applicant can take all courses  
4. If complete payment applicant can take all ticket courses and exams  
5. On submit Mail is sent  
6. On fail mail is sent  
7. On pass mail is sent  
8. The first attempt is truly properly graded.  
9. If candidate truly failed first attempt second attempt is automatically passed at the pass mark

   > > > > > > 