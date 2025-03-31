import { Resend } from 'resend';
import config from '../config/config.js';
import logger from '../util/logger.js';

const resend = new Resend(config.EMAIL_SERVICE_API_KEY);

const sendEmail = async (to, subject, text) => {
    try {
        await resend.emails.send({
            from: `Authentication System <onboarding@resend.dev>`,
            to,
            subject,
            text
        });
    } catch (err) {
        logger.error('EMAIL_SERVICE_ERROR', {
            meta: err
        });
    }
};

export default sendEmail;
