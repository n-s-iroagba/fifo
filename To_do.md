TEMPLATES

1. Nomination Template  
1. Use of Multiple Roles Template  
1. Actual Document Creation Rules  
1. Select candidate from dropdown  
2. Enter total Applicants  
3. Enter company name and number of required applicants

   

2. Single Role Template  
1. Actual Document Creation Rules  
1. Select candidate from drop down.  
2. Enter total Applicants  
3. Enter company name, role title and number of required applicants.

2. Contract Document Template  
1. Actual Document Creation  
1. Select applicant from dropdown  
2. Apply subsidy percentage   
3. Fix in details correctly   
4. Enter nomination details manually.  
5. Fix in current date  
3. Invoice Template  
1. Part Aveling  
1. from dropdown  
2. Enter the part amount.  
3. Retrieve total cost of applicant tickets and apply subsidy percentage to it.  
2. Full After part aveling  
1. Select applicant from dropdown  
2. Enter the part amount.  
3. Retrieve part paid invoice  
4. Retrieve total cost of applicant tickets and apply subsidy percentage to it.  
3. Aveling Second attempt  
5. Select applicant from dropdown  
6. Enter the part amount.  
7. Retrieve part paid invoice  
8. Retrieve total cost of applicant tickets and apply subsidy percentage to it.  
4. Full Aveling  
1. Select applicant from dropdown  
2. Enter the part amount.  
3. Retrieve total cost of applicant tickets and apply subsidy percentage to it.  
4. Apply 10% full discount.

5. Visa Blue Collar  
1. Select applicant from dropdown  
2. Enter the amount  
4. Receipt Template  
1. Receipt created is linked to invoice.  
2. Receipt type are based of invoiceType : aveling | blue collar.

TODOS

~~1. Create Nomination form and mail page.~~  
~~2. Create subsidy percentage editing ui~~  
~~3. Email Page should populate email template message with applicant details on the client app~~  
~~4. Add email capability from the application details page~~  
~~5. Remove job condition feature~~  
~~6. Create invoice model linked to applicant (amount, item: ticket-partial | complete-after-partial, ticket-complete | visa, paymentStatus: unpaid, pending-approval, paid receiptsubmissiondate, createdat)~~  
~~7. Link tickets to job listing, many to many associations.~~  
~~8. Remove benefit catalogue.~~  
9. Remove benefit model  
10. Remove applicant and ticket link.  
11. Add applicant subsidy percentage attribute to model (default is 70%).  
12. Admin Read and update Applicant percentage subsidy  
13. Add redirect link on the email verification link to match the last public page visit or expression of interest page if the job searched was not found.  
14. [x] Invoice Table  
15. [x] Single Page Invoice  
16. Seed tickets and courses before contract presentation  
17. Select details during contract other document presentation

Mail Functions /Templates

1. Verify Email (Auth)  
2. Welcome Email \- Application found (INFO BLUE)  
3. Eoi received Email (INFO BLUE)  
4. EoI Addressed Email  (INFO BLUE)  
5. CV upload Email  (INFO BLUE)  
6. Bio received Email  (INFO BLUE)  
7. psychometric module 1 passed mail  (INFO BLUE)  
8. psychometric module 2 submitted email  (INFO BLUE)  
9. psychometric module 2 passed  (INFO BLUE)  
10. Application submitted mail ( Application in review)  (INFO BLUE)  
11. Application Accepted mail (subject to CRON JOB 6HRS AFTER SUBMISSION)  (INFO BLUE)  
12. Notification form mail  (INFO BLUE)  
13. Contract form mail  (INFO BLUE)  
14. Invoice  
1.  (partial) Mail (AVELING INFO)  
2. Mail \- partial-after- complete (AVELING INFO)  
3. Mail complete (AVELING INFO)  
4. Mail second Attempt (AVELING INFO)  
5. Mail Shipping (Blue Collar INFO)  
6. Mail Visa sponsorship (Blue Collar INFO

15. Payment Proof reception Acknowlegdement  
7.  (partial) Mail (AVELING INFO)  
8. Mail \- partial-after- complete (AVELING INFO)  
9. Mail complete (AVELING INFO)  
10. Mail second Attempt (AVELING INFO)  
11. Mail Shipping (Blue Collar INFO)  
12. Mail Visa sponsorship (Blue Collar INFO  
16. Receipt  
13.  (partial) Mail (AVELING INFO)  
14. Mail \- partial-after- complete (AVELING INFO)  
15. Mail complete (AVELING INFO)  
16. Mail second Attempt (AVELING INFO)  
17. Mail Shipping (Blue Collar INFO)  
18. Mail Visa sponsorship (Blue Collar INFO

| sn | Applicant Action | Admin PreAction | Business Logic | Stage Action | Mail |
| :---- | :---- | :---- | :---- | :---- | :---- |
|  | Sign up |  | Create applicant & Verify email redirect link to dashboard | Stage: Application Status : not started  | Welcome mail  |
|  | Job search Found | Seed Jobs | Not registered: \-Create account \-verify email redirect link to job details page Not logged in: login and redirect to job details page Logged in: redirect to job details page . |  |  |
|  | Job search Not Found |  | Not registered: \-Create account \-verify email redirect link to expression of interest page Not logged in: login and redirect to expression of interest page Logged in: redirect to expression of interest page. |  |  |
|  | Psychometric module 1 passed |  | Module 1 is an instant pass irrespective of answer, with random scores from 70 to 77% | On submission,  The stage is changed to  Application Status: awaiting completion module 2 psychometric test | Mail on stage pass and nudge to take module 2 |
|  | Psychometric module 2 submitted |  | Not graded Admin decides pass or fail | On submission stage is still Application, Status psychometric tests passed, On admin fail Status: previous attempt failed | Mail on pass or fail, nudge to submit application or retake |
|  | Psychometric module 2 failed |  |  |  |  |
|  | Psychometric module 2 passed. |  |  |  | Submit application cv, bio |
|  | Application Submitted |  |  |  | Mail sent stating application submitted is in review |
|  | Application Review Cron |  |  |  | Cron job mail sent informing applicant of successful application and next steps |
|  | Nomination Presentation | Admin drafts document on client app by filling a form that prefills and clicks send, which sends the form along side mail |  | On send mail Stage: Nomination  Status: ongoing | Mail is sent together with prefilled document from template  |
|  | Contract Presentation Mail | Admin drafts document on client app by filling a form that prefills and clicks send, which sends the form along side mail  |  | On send with mail Stage : Contract Agreement Status: ongoing | Mail is sent together with prefilled document from template |
|  | Invoice Creation | Admin drafts document on client app by filling a form that prefills and clicks send, which sends the form along side mail If aveling invoice for complete, or partial only: Create Aveling Credentials and send a second mail with credentials for easy copying. |  | On send with mail  If aveling partial,complete after payment,complete: Stage: ticket course and examination exam Status: ongoing  If visa, Stage: visa sponsorship  Status: ongoing | Mail is sent together with prefilled document from template |
|  | Invoice payment Upload |  |  |  | Send mail of acknowledgement. |
|  | Invoice payment confirmation |  | If invoice is for aveling, complete or partial after complete can take all exams, Partial can only take 4 ticket exams. Receipt for all and send mail Generation |  |  |
|  | Aveling Credential Mail |  |  |  |  |
|  | Ticket Courses And Exam and digital delivery on passing |  |  |  | Status: not started, ongoing, completed. |
|  | Shipping Address collection Mail |  |  |  |  |

    