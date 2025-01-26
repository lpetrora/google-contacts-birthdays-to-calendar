const targetCalendarId = null;
const targetCalendar = CalendarApp.getOwnedCalendarById(targetCalendarId); 
const reminderOffset = 1 * 24 * 60; // 1 days * 24 hours * 60 minutes. Set it to null to avoid adding remainders

if (! targetCalendar ) {
  //Target calendar not found. List all calendars with their ids and exit
  const calendars = CalendarApp.getAllCalendars()
  calendars.forEach ( calendar => Logger.log (`Calendar Name: ${calendar.getName()} -- id: ${calendar.getId()}`))

  throw `Calendar with id '${targetCalendarId}' not found. Please set the targetCalendar variable to one of the previous list`;
}

// Loop through contacts that have a birthday
function main() {
  let birthdaysCounter = 0;
  var contacts = ContactsApp.getContacts();
  contacts.sort( (a,b) => a.getFullName().localeCompare(b.getFullName()))

  for (var i = 0; i < contacts.length; i++) {
    var contact = contacts[i];
    var birthdays = contact.getDates(ContactsApp.Field.BIRTHDAY);
    if (birthdays.length > 0) {
      birthdaysCounter ++;
      var birthdayField = birthdays[0];
      updateOrCreateBirthDayEvent(contact, birthdayField);
    }
  }

  Logger.log (`Processed ${contacts.length} contacts and ${birthdaysCounter} birthdays`);
}

function updateOrCreateBirthDayEvent(contact, birthdayField) {
  const contactName = contact.getFullName();
  const nextBirthday = calculateNextBirthday(birthdayField);

  const ageAtNextBirthday = nextBirthday.getFullYear() - birthdayField.getYear();
  const suffix = ageAtNextBirthday !== nextBirthday.getFullYear() ? "'s birthday (" + ageAtNextBirthday + ")" : "'s birthday";
  const title = contactName + suffix;

  var birthdayEvent = findBirthdayEvent(targetCalendar, contactName, nextBirthday);
  
  if (birthdayEvent) {
    if (birthdayEvent.getTitle() == title && birthdayEvent.isAllDayEvent()) {
      Logger.log("Skipped event: " + title);
      return;
    }

    // Update the existing event
    birthdayEvent.setTitle(title);
    birthdayEvent.setAllDayDate(new Date(nextBirthday.getFullYear(), nextBirthday.getMonth(), nextBirthday.getDate()));

    if (reminderOffset !== null) {
      var reminders = birthdayEvent.getPopupReminders();
      if (!reminders.includes(reminderOffset)) {
        birthdayEvent.addPopupReminder(reminderOffset);
      }
    }

    Logger.log("Updated event: " + title);
  } else {
    // Create new event
    var startTime = new Date(nextBirthday.getFullYear(), nextBirthday.getMonth(), nextBirthday.getDate());
    var allDayEvent = targetCalendar.createAllDayEvent(title, startTime);    

    if (reminderOffset !== null) {
      allDayEvent.addPopupReminder(reminderOffset);
    }
    
    Logger.log("Created new event: " + title);
  }
}

function findBirthdayEvent(calendar, contactName, nextBirthday) {
  const startDate = new Date(nextBirthday.getFullYear(), nextBirthday.getMonth(), nextBirthday.getDate());
  var endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 1);

  var events = calendar.getEvents(startDate, endDate);
  var searchPattern = contactName + "'s birthday";

  for (var i = 0; i < events.length; i++) {
    var eventTitle = events[i].getTitle();
    if (eventTitle.includes(searchPattern)) {
      return events[i];
    }
  }

  return null;
}

function calculateNextBirthday(birthdayField) {
  var monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  var day = birthdayField.getDay();
  var monthName = birthdayField.getMonth().toString(); // Convert to uppercase
  var month = monthNames.indexOf(monthName);

  var today = new Date();
  var nextBirthdayYear = today.getFullYear();
  
  var thisYearsBirthday = new Date(today.getFullYear(), month, day);
  if (today >= thisYearsBirthday) {
    nextBirthdayYear++;
  }

  var nextBirthDay = new Date(nextBirthdayYear, month, day);
  return nextBirthDay;
}
