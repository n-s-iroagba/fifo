/**
 * onboardingCron.ts
 * Stage 2: Onboarding process email sent as cron after interview mail has been sent - 1hr.
 *
 * Requirements:
 * 1. Attached maca-employee-onboarding-guide.pdf file prefilled with applicant's details according to the template.
 * 2. Contact email bf:
 *    * Strong notice should be given regarding non-Australians using the Australian communication channel and vice versa,
 *      as this will result in delay in response or no response at all.
 *    1. For Australian and New Zealand Residents: all.recruitment@maca.net.au
 *    2. For Non Australian or New Zealand Residents: recruitement@maca.works
 * 3. State boldly that upon finalisation of employment and visa processing, applicants must submit photocopies of all
 *    documents contained in the attached file i.e maca-employee-onboarding-guide.pdf to the human resource department
 *    using the email hr@maca.net.au. Applicant should know that this step is important to initiate employee onboarding.
 */

import { Op } from 'sequelize';
import { User, Interview, Application, JobListing, JobStage } from '../models';
import { sendEmployerEmail, sendInfoEmail } from '../utils/email';
import { generateMacaOnboardingGuidePDF } from '../utils/macaOnboardingGuide';
import { recordCronRun, isCronPaused, isApplicationCronPaused } from './cronRegistry';
import { logger } from '../utils/logger';

const CRON_NAME = 'OnboardingFollowup';
const ONE_HOUR_MS = 60 * 60 * 1000;

export interface DispatchOnboardingResult {
    success: boolean;
    message: string;
}

/**
 * Core dispatch function for sending the Stage 2 Onboarding Process Email with
 * prefilled maca-employee-onboarding-guide.pdf and mandatory regional email directives.
 */
export async function dispatchApplicantOnboardingGuide(applicantId: number): Promise<DispatchOnboardingResult> {
    const applicant = await User.findByPk(applicantId);
    if (!applicant) {
        throw new Error(`Applicant ${applicantId} not found`);
    }

    // Find application & job details
    const application = await Application.findOne({
        where: { userId: applicant.id },
        include: [{ model: JobListing, as: 'JobListing' }]
    });

    const jobListing = (application as any)?.JobListing;
    const roleTitle = jobListing?.title || 'FIFO Mining & Civil Infrastructure Specialist';

    // Fetch interview details
    const interview = await Interview.findOne({
        where: { applicantId: applicant.id }
    });

    const effectiveDate = interview?.interviewDate || applicant.interviewDate || null;
    const effectiveTime = interview?.interviewTime || applicant.interviewTime || null;
    const effectiveTz = interview?.timezone || 'AWST (UTC+8)';
    const effectiveLink = interview?.interviewUrl || interview?.meetingLink || applicant.interviewLink || null;

    // 1. Generate prefilled maca-employee-onboarding-guide.pdf
    const onboardingPdf = generateMacaOnboardingGuidePDF({
        applicantName: applicant.fullName,
        roleTitle,
        interviewDate: effectiveDate,
        interviewTime: effectiveTime,
        interviewLink: effectiveLink,
        timezone: effectiveTz
    });

    // 2. Email subject and HTML body
    const emailSubject = `MACA Employee Onboarding Guide: Interview to Mobilisation Roadmap — ${roleTitle}`;
    const emailContent = `
        <p>Dear ${applicant.fullName},</p>
        <p>Following your interview confirmation, we are providing the official <strong>MACA Employee Onboarding Guide (<code>maca-employee-onboarding-guide.pdf</code>)</strong> attached to this email.</p>
        <p>This comprehensive roadmap details the exact milestones from your upcoming technical interview to final site deployment in Western Australia, including our TRA skills assessment protocol, temporary resident nomination (TRN), pre-employment medical clearances, and fully funded flight and relocation benefits.</p>

        <!-- Strong Notice: Regional Communication Protocol -->
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px 20px; margin: 24px 0; border-radius: 4px;">
            <p style="margin: 0 0 6px 0; font-size: 13.5px; font-weight: bold; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">
                ⚠️ CRITICAL NOTICE: REGIONAL COMMUNICATION CHANNELS
            </p>
            <p style="margin: 0; font-size: 13px; color: #b91c1c; line-height: 1.5;">
                <strong>Strong notice is given regarding non-Australians using the Australian communication channel and vice versa, as this will result in delay in response or no response at all.</strong> You must strictly communicate through your designated regional channel:
            </p>
            <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #fecaca;">
                <p style="margin: 4px 0; font-size: 13px; color: #7f1d1d;">
                    🇦🇺 <strong>For Australian and New Zealand Residents:</strong> <a href="mailto:all.recruitment@maca.net.au" style="font-weight: bold; color: #b91c1c; text-decoration: underline;">all.recruitment@maca.net.au</a>
                </p>
                <p style="margin: 4px 0; font-size: 13px; color: #7f1d1d;">
                    🌏 <strong>For Non Australian or New Zealand Residents:</strong> <a href="mailto:recruitement@maca.works" style="font-weight: bold; color: #b91c1c; text-decoration: underline;">recruitement@maca.works</a>
                </p>
            </div>
        </div>

        <!-- Bold Mandatory HR Submission Protocol -->
        <div style="background-color: #fffbeb; border: 2px solid #f59e0b; padding: 20px 24px; margin: 24px 0; border-radius: 6px;">
            <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 800; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px;">
                📌 MANDATORY STEP TO INITIATE EMPLOYEE ONBOARDING
            </p>
            <p style="margin: 0; font-size: 13.5px; color: #78350f; line-height: 1.6; font-weight: bold;">
                IT IS MANDATORY THAT UPON FINALISATION OF EMPLOYMENT AND VISA PROCESSING, APPLICANTS MUST SUBMIT PHOTOCOPIES OF ALL DOCUMENTS CONTAINED IN THE ATTACHED FILE (<code>maca-employee-onboarding-guide.pdf</code>) TO THE HUMAN RESOURCE DEPARTMENT USING THE EMAIL:
            </p>
            <p style="margin: 8px 0; font-size: 15px; font-weight: 800; color: #b45309;">
                📧 <a href="mailto:hr@maca.net.au" style="color: #b45309; text-decoration: underline;">hr@maca.net.au</a>
            </p>
            <p style="margin: 8px 0 0 0; font-size: 12.5px; color: #92400e; line-height: 1.5;">
                Applicants must understand that this step is critically important to initiate formal employee onboarding, generate your employee staff ID, issue site induction credentials, and schedule your flight mobilisation to Western Australia.
            </p>
        </div>

        <p>Please review the attached guide carefully and retain it for your records prior to your scheduled interview.</p>
        <p style="margin-top: 24px; font-size: 12px; color: #64748b;">
            Yours faithfully,<br>
            <strong>MACA Limited Human Resources & Recruitment Directorate</strong><br>
            45 Briggs St, Welshpool WA 6106 | <a href="https://maca.net.au" style="color: #64748b;">maca.net.au</a>
        </p>
    `;

    // 3. Dispatch email from Employer email account
    await sendEmployerEmail(applicant.email, emailSubject, emailContent, [
        {
            filename: 'maca-employee-onboarding-guide.pdf',
            content: onboardingPdf,
            contentType: 'application/pdf'
        }
    ]);

    // 4. Update database records
    const now = new Date();
    if (interview) {
        interview.onboardingEmailSent = true;
        interview.onboardingEmailSentAt = now;
        await interview.save();
    }

    applicant.onboardingEmailSent = true;
    applicant.onboardingEmailSentAt = now;
    await applicant.save();

    logger.info(`[OnboardingCron] Dispatched MACA Onboarding Guide PDF to ${applicant.email}`);
    return {
        success: true,
        message: `MACA Onboarding Guide PDF successfully dispatched to ${applicant.fullName} (${applicant.email}).`
    };
}

/**
 * Runs the 1-hour post-interview onboarding process email cron job.
 * Finds all candidates whose interview email was dispatched >= 1 hour ago and who have
 * not yet received their onboarding process email.
 */
export async function runOnboardingCron(forceUserId?: number): Promise<number> {
    try {
        if (!forceUserId && isCronPaused('onboarding')) {
            console.log('[OnboardingCron] Execution skipped: Onboarding stage cron is paused.');
            return 0;
        }

        const start = Date.now();
        console.log('[OnboardingCron] Checking for applicants pending 1-hour post-interview onboarding email...');

        const cutoff = new Date(Date.now() - ONE_HOUR_MS);

        let matchingInterviews: Interview[] = [];

        if (forceUserId) {
            matchingInterviews = await Interview.findAll({
                where: { applicantId: forceUserId }
            });
            if (matchingInterviews.length === 0) {
                // If no interview record exists, check if user exists
                const user = await User.findByPk(forceUserId);
                if (user) {
                    await dispatchApplicantOnboardingGuide(forceUserId);
                    return 1;
                }
            }
        } else {
            // Find interviews where interview email was sent >= 1 hour ago and onboarding email is not yet sent
            matchingInterviews = await Interview.findAll({
                where: {
                    interviewEmailSentAt: { [Op.lte]: cutoff },
                    onboardingEmailSent: false
                }
            });
        }

        console.log(`[OnboardingCron] Found ${matchingInterviews.length} candidate(s) eligible for onboarding email.`);

        let processedCount = 0;

        for (const interview of matchingInterviews) {
            const applicantId = interview.applicantId;

            // Check if cron is paused for this applicant's application
            const application = await Application.findOne({ where: { userId: applicantId } });
            if (!forceUserId && application && isApplicationCronPaused(application, 'onboarding')) {
                console.log(`[OnboardingCron] Skipping applicant ${applicantId}: cron is paused for this application.`);
                continue;
            }

            try {
                await dispatchApplicantOnboardingGuide(applicantId);
                processedCount++;

                // Notify admin of successful cron execution
                const user = await User.findByPk(applicantId);
                const adminEmail = 'nnamdisolomon1@gmail.com';
                const adminSubject = `Cron Action Executed: 1h Post-Interview Onboarding Guide Dispatched — ${user?.fullName || 'Applicant'}`;
                const adminContent = `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2 style="color: #ed1b2d;">MACA Onboarding Guide Dispatched (1h Cron)</h2>
                        <p><strong>Cron Job:</strong> ${CRON_NAME}</p>
                        <p><strong>Action Taken:</strong> Automatically generated and emailed <code>maca-employee-onboarding-guide.pdf</code> with regional communication channels and mandatory HR submission protocol to the candidate 1 hour post-interview dispatch.</p>
                        <p><strong>Applicant:</strong> ${user?.fullName || 'Unknown'} (ID: ${applicantId}, Email: ${user?.email || 'N/A'})</p>
                        <p><strong>Interview Date/Time:</strong> ${interview.interviewDate || 'N/A'} at ${interview.interviewTime || 'N/A'}</p>
                        <p><strong>Sent At:</strong> ${new Date().toISOString()}</p>
                    </div>
                `;
                await sendInfoEmail(adminEmail, adminSubject, adminContent).catch(e =>
                    console.error('[OnboardingCron] Admin email report failed:', e)
                );
            } catch (dispatchErr) {
                console.error(`[OnboardingCron] Failed to dispatch onboarding guide for applicant ${applicantId}:`, dispatchErr);
            }
        }

        recordCronRun('onboarding', 'ok');
        return processedCount;
    } catch (error: any) {
        recordCronRun('onboarding', 'error', error?.message);
        console.error('[OnboardingCron] Error running onboarding cron:', error);
        return 0;
    }
}
