const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

// حط هنا رابط الـ Web App اللي أخدناه من جوجل شيت (بين علامتين التنصيص)
const GOOGLE_SCRIPT_URL = 'YOUR_WEB_APP_URL_HERE';

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('--- SCAN THIS QR CODE WITH WHATSAPP ---');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('WhatsApp Bot is ready and online!');
});

client.on('message', async msg => {
    if (msg.type === 'location') {
        const phone = msg.from.replace('@c.us', '');
        const location = msg.location;
        const locationUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;

        try {
            const response = await axios.post(GOOGLE_SCRIPT_URL, {
                phone: phone,
                locationUrl: locationUrl
            });

            const empName = response.data.empName || 'موظف';
            msg.reply(`أهلاً بك يا ${empName}، تم تسجيل حضورك بنجاح! 🕒✅`);
        } catch (error) {
            console.error('Error sending to sheets:', error);
            msg.reply('عذراً، حدث خطأ أثناء تسجيل الحضور. حاول مرة أخرى.');
        }
    } else {
        msg.reply('أهلاً بك! لتسجيل الحضور، يرجى إرسال موقعك الحالي (Location) حصراً من خيارات الواتساب 📍');
    }
});

client.initialize();
