const cron = require('node-cron');
function showMessage() {
 console.log('Cron job executed at:', new Date().toLocaleString());
}
// cron job scheduled at every minute
cron.schedule('* * * * *', () => {
 showMessage();
});