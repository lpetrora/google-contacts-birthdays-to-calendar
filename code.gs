const targetCalendarId = null;
const targetCalendar = CalendarApp.getOwnedCalendarById(targetCalendarId); 
const reminderOffset = 1 * 24 * 60; // 1 days * 24 hours * 60 minutes. Set it to null to avoid adding remainders

if (! targetCalendar ) {
  //Target calendar not found. List all calendars with their ids and exit
  const calendars = CalendarApp.getAllCalendars()
  calendars.forEach ( calendar => Logger.log (`Calendar Name: ${calendar.getName()} -- id: ${calendar.getId()}`))

  throw `Calendar with id '${targetCalendarId}' not found. Please set the targetCalendar variable to one of the previous list`;
}

// Entry point
function main() {
  const contacts = getContactsWithBirthdays();
  for (contact of contacts) {
    updateOrCreateBirthDayEvent(contact);
  }

  Logger.log (`Processed ${contacts.length} contacts with birthday`);
}

class Contact {
  constructor (fullName, birthday = null) {
    this.fullName = fullName;    
    this.birthday = birthday;
  }

  getFullName () {
    return this.fullName
  }

  getBirthday () {
    return this.birthday
  }
}

function getContactsWithBirthdays() {
    
  let nextPageToken = '';
  const result = [];

  while (nextPageToken !== null) {
    const people = People.People.Connections.list('people/me', {
      personFields: 'names,birthdays',
      pageToken: nextPageToken,
    });

    for (person of people.connections) {
      const displayName = person.names[0].displayName;
      const birthday = person?.birthdays ? person.birthdays[0].date : null;
      if (birthday === null) continue;      
      result.push( new Contact (displayName, birthday) );
    }

    nextPageToken = people?.nextPageToken || null;
  }
  
  result.sort( (a,b) => a.getFullName().localeCompare(b.getFullName()))

  return result;
}

function updateOrCreateBirthDayEvent(contact) {
  const contactName = contact.getFullName();
  const birthdayField = contact.getBirthday();
  const nextBirthday = calculateNextBirthday(birthdayField);

  const pattern = "'s birthday"

  const suffix = ( !! birthdayField.getYear()) ?
    `${pattern} (${nextBirthday.getFullYear() - birthdayField.getYear()})` : 
    pattern;
    
  const title = contactName + suffix;

  const birthdayEvent = findBirthdayEvent(targetCalendar, contactName, nextBirthday, pattern);
  
  if (birthdayEvent) {
    if (birthdayEvent.getTitle() == title && birthdayEvent.isAllDayEvent()) {
      Logger.log(`Skipped event:  ${title}`);
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

    Logger.log(`Updated event: ${title}`);

  } else {
    // Create new event
    var startTime = new Date(nextBirthday.getFullYear(), nextBirthday.getMonth(), nextBirthday.getDate());
    var allDayEvent = targetCalendar.createAllDayEvent(title, startTime);    

    if (reminderOffset !== null) {
      allDayEvent.addPopupReminder(reminderOffset);
    }
    
    Logger.log(`Created new event: ${title}`);
  }
}

function findBirthdayEvent(calendar, contactName, nextBirthday, pattern) {
  const startDate = new Date(nextBirthday.getFullYear(), nextBirthday.getMonth(), nextBirthday.getDate());
  var endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 1);

  var events = calendar.getEvents(startDate, endDate);
  var searchPattern = contactName + pattern;

  for (var i = 0; i < events.length; i++) {
    var eventTitle = events[i].getTitle();
    if (eventTitle.includes(searchPattern)) {
      return events[i];
    }
  }

  return null;
}

function calculateNextBirthday(birthdayField) {
  const day = birthdayField.getDay();
  const month = birthdayField.getMonth() -1;


  var today = new Date();
  var nextBirthdayYear = today.getFullYear();
  
  var thisYearsBirthday = new Date(today.getFullYear(), month, day);
  if (today >= thisYearsBirthday) {
    nextBirthdayYear++;
  }

  var nextBirthDay = new Date(nextBirthdayYear, month, day);
  return nextBirthDay;
}
