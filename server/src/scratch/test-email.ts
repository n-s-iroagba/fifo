import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the server directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

const testEmail = async () => {
    console.log('--- Email Connection Diagnostic Tool ---');
    console.log(`SMTP Host: ${process.env.SMTP_HOST}`);
    console.log(`SMTP Port: ${process.env.SMTP_PORT}`);
    console.log(`SMTP User: ${process.env.SMTP_AUTH_USER}`);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '465', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_AUTH_USER,
            pass: process.env.SMTP_AUTH_PASS,
        },
    });

    try {
        console.log('\nTesting SMTP Connection...');
        await transporter.verify();
        console.log('✅ Connection Successful! The server can talk to the mail provider.');

        console.log('\nAttempting to send test email...');
        const info = await transporter.sendMail({
            from: process.env.SMTP_AUTH_FROM || `"BlueCollarRecruitment Diagnostic" <${process.env.SMTP_AUTH_USER}>`,
            to: process.env.SMTP_AUTH_USER, // Send to self
            subject: 'Diagnostic Test Pulse',
            text: 'If you receive this, the email dispatch pipeline is fully operational.',
            html: '<b>Diagnostic Test Pulse:</b> Operational.',
        });

        console.log('✅ Email Dispatched Successfully!');
        console.log('Message ID:', info.messageId);
        console.log('\nNext Step: Check your inbox (and spam) for the message.');
    } catch (error: any) {
        console.error('\n❌ Diagnostic Failed!');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        console.error('Response Code:', error.responseCode);
        console.log('\nTroubleshooting Hints:');
        if (error.code === 'EAUTH') {
            console.log('- Authentication failed. Check your password. If using Namecheap, ensure you are NOT using a Gmail password.');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('- Connection timed out. The server might be blocking port 465, or the host address is wrong.');
        }
    }
};

testEmail();
