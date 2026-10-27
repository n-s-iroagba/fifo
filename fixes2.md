1. Create email 7a and email 7b  
1. Employer selection submitted email \- 7a, this runs any time the applicant submits the Employer selection form on the dashboard/nominations page.  
2. Employer selection filled email \-7b , this runs If submitted selection does not match maca i.e Employer with isEmploying \= true flag or any other similar flag in the implementation and Employer Selection Filled mail is sent.  
* The Employer Selection Filled Mail is used to tell the applicant that their previously selected employer vacancy has been filled and they should accept the only available option which is maca i.e Employer with isEmploying \= true flag or any other similar flag.  
* They are presented with another Employer selection form containing only maca i.e Employer with isEmploying \= true flag or any other similar flag   
* The dashboard/notifications page shows only maca i.e Employer with isEmploying \= true flag or any other similar flag as the only option (in 1a above all Employers are shown, and applicant is asked to select the employer they chose in the Employer Selection form during submission of the form.  
* If 7b is to run, the employer selection cron should not run, the only condition for the employer selection acceptance is the most current selection  is maca i.e Employer with isEmploying \= true flag or any other similar flag in the implementation   
2. Remove system trigger information from all mails, Applicants should not know triggers or internal implementations or procedures  
3. The call for ticket sponsorship mail should clearly state the following in order :   
1. That the employer  maca i.e Employer with isEmploying \= true flag or any other similar flag only temporarily covers ticket sponsorship partially.  
2. Ask applicants to keep an eye on their mail box, as the employer will ask for a bank account to deposit their refund soon.  
3. State that employer demands a temporary financial commitment from the applicant to reduce drop off rates and in turn reduce the financial waste for the employer  
4. State that applicants  are not in any way paying Blue Collar Recruitment Pty Ltd.  
5. State that applicants shall pay Cert Hero RTO after they have been enrolled for the ticket courses; not before, but a commitment deposit will be required to complete the courses and write the examinations.  
6. State that applicants can pay half of the fee initially and complete the balance mid way or towards the end of the training  
7. State that the employer employer shall refund 100% of their expenditure if they successfully complete the training and acquire the necessary tickets and 80% on failure  to do so, with the 20% accounting for admin fees  
8. State percentage of coverage and applicant payable amount in AUD.

   

4. Create Email 12b  
* Sender \- System \- Employer \- Cron; sent just immediately after sending email 12 (i.e immediately after call for ticket sponsorship email by blue collar).  
* The email should do the following in order:  
1. Ask the applicant to reply to the email with a bank account to the collection of their refunds of the money spent on training.  
2. Notify the applicant of the partial sponsorship using an effective variation of 3 (1,3,5, 6, 7, 8) above.  
5. Design the Employer email with maca theme and logo from [https\://maca.net.au](https://maca.net.au)  
6. Write 3g above as the refund policy in the invoice email.  
7. Ask the applicant to respond to the invoice email (in the invoice email) with their preferred date and time of payment so that their application manager can be online and offer assistance, if needed.  
8. Consult [CHANGE.md](http://CHANGE.md) and implement invoicing to specification with out  
9. Invoicing email has link for card and crypto payments; card does work and triggers crypto, screenshot for agent as confirmation, for card or crypto say time for guidance, add the agent proximity and cost and delay reduction clause, all payments should have pro and cons, crypto click also triggers crypto)  
10. The crypto payment direction email must do the following but not limited to   
1. Include the crypto faq link so that applicant can clear their doubt.  
2. Good psychology without sounding fake or automated to encourage applicants to make payment with crypto; AI AGENT should use mild persuasion and must avoid sounding like robot or fool  
3. It must assure the applicant that bitget is safe and CertHero is a bonafide partner,for b and c use sensible language  
4. The email should have an apple store download link, google play store download link, browser extension download links to download the bitget application or extension on their device.  
5. The cryptowallet stored in database is fetched and converted to a clickable and scannable qr code sent in the mail to accept payments  
* Use the link ([https\://web3.bitget.com/en/docs/configuration/deeplink](https://web3.bitget.com/en/docs/configuration/deeplink)) to achieve the highest degree of control for a third party dev with no developer account or kyc. ENSURE YOU GIVE THE DEEPEST POSSIBLE CONTROL  
1. If the qr is clicked or scanned, it checks if the bitget wallets exists on the device  
2. If not on the device, it opens an appropriate app or extension store so that the applicant can download .  
3. If 2 just above  is not possible at runtime or device, it asks the user to install the bitget wallet  
4. If the wallet exists after the click or scan, to open the bitget app or extension to the farthest crypto purchase stem page.

   

5. The mail should have a link to payment instructions, onclicking the link the applicant is navigated to the cert hero crypto checkout page  
6. Ensure that both crypto direction email and the crypto checkout page give clear instructions for ease and zero mistake  
7. The workflow above a suggestion, if there are changes that could make hpayment seamless for the applicant while adhering to reality, I’d appreciate that; the aim here is trust building, clarity on procedure and ease of payment  
11. Changes this line ‘. Copies have also been forwarded to MACA LIMITED and Trades Recognition Australia (TRA) for your visa skills assessment.’ to this in ticket delivery email to this ‘. Copies have also been forwarded to MACA LIMITED and they shall be required by  the Trades Recognition Australia (TRA) for your visa skills assessment.’  
12. Change all of these  \<[info@jobnexe.com](mailto:info@jobnexe.com)\> to  \<info@bluecollarrecruitment.co\>  
      
13. Implement the following in [CHANGES.md](http://CHANGES.md) (all implementations are in the rto app)  
1. Feature group 10 and do the following also  
1. Implement a page of the crypto checkout  with details in 8 above.  
2. Create a card payment page that operates as specified by [CHANGES.md](http://CHANGES.md) document.  
3. Agent bank account  and crypto wallet are different. The agent bank account is for receiving international USD swift wire transfers  
2. Ensure feature group  11 implementation and logic makes sense  
3. Implement crypto wallet crud, only one usdt tron wallet can be saved in the database per time.  
14. Ensure all work take you time false positives will cost me greatly  
1. Onboarding  
2. Application  
3. Employer selection  
1. Initial  
2. Filled  
3. Accepted  
4. Employer contacts  
1. Interview (notify of onboarding mail with necessary communication channel in next mail)  
2. Onboarding.  
5. Ticket Sponsorship   
1. Call  
2. Apply  
3. Accept  
6. Ticket Training  
1. Enrollment  
1. Mail  
2. Login  
3. Ai bot  
4. Course access.  
2. Contract(Rto first login) .  
1. Delivery  
2. Upload  
3. Acceptance and sponsorship ID  
7. Invoicing  
8. Crypto payment  
9. Course access  
10. Examination  
11. Partial payment completion  
12. Ticket delivery  
13. Drop off  
14. Handoff

    

15. 

    

    

