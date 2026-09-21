/** Run once from the editor as the owner. Never called by the public web app. */
function setupWebsite() {
  const properties = PropertiesService.getScriptProperties();
  if (!properties.getProperty('BOOKING_CALENDAR_ID')) {
    const calendar = CalendarApp.createCalendar('Lévay Melitta — website appointments', {
      timeZone: 'Europe/Budapest',
      summary: 'Dedicated preview website calendar. Separate from Integral Counseling.'
    });
    properties.setProperty('BOOKING_CALENDAR_ID', calendar.getId());
  }
  properties.setProperty('RECIPIENT_EMAIL', Session.getEffectiveUser().getEmail());
  console.log('Website configuration is ready. Dedicated calendar is configured.');
}
