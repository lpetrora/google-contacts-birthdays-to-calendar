# Auto-Birthdays: Google Apps Script for importing contact birthdays into a calendar

## Overview
Based on [Auto-Birthdays](https://github.com/FlorisDeVries/Auto-Birthdays), this script automates the proces of creating and updating birthday events in Google Calendar based on your Google Contacts. 
For each contact with a birthday, it adds an all-day event in your Google Calendar and sets a reminder.

## Features
- **Automatically Update Events**: Updates titles of existing events to include age and sets them as all-day events.
- **Create New Events**: If no birthday event exists for a contact, creates a new all-day event with a reminder.
- **Daily Automation**: Designed to run daily to keep your calendar updated.

## Setup Instructions
1. **Open Google Apps Script**: Navigate to [Google Apps Script](https://script.google.com) and create a new project
2. **Copy the Script**: Copy the provided script into the script editor
3. **Add People Api service**:
   - Click on the "+" sign in services
   - Search for "Person Api"
   - Select it and click "Add"   
4. **Run & Permissions**: From the script editor click on "Run" and accept permissions when asked
5. **Customize Script**: Replace the `targetCalendarId` on line 16 with the target CalendarID
   - Run the script manually, as it will display a list of calendars with their respective id.
   - Choose the `id` of your calendar
   - Update `targetCalendarId` variable to that value
6. **Adjust reminder**: Update the `reminderOffset` variable
   - If you don't want any reminder, set it to `null`
   - Set how many minutes before the birthday day you want a reminder
7. **Set Trigger**: Set a daily trigger to run the `main` function
    - Click on the clock icon (Triggers) on the left sidebar
    - Click on "+ Add Trigger" at the bottom right corner of the screen
    - Choose the function you want to run from the "Choose which function to run" dropdown (main)
    - Choose "Time-driven" from the "Select event source" dropdown
    - Choose the type of time trigger (e.g., "Day timer") and specify the time range
8. **Deploy**: Save changes

## Usage
This script automatically updates and creates birthday events in Google Calendar based on birthdays in your Google Contacts. To ensure it works correctly:

1. **Adding Birthdays to Contacts**:
   - Navigate to [Google Contacts](https://contacts.google.com) or go-to contacts on your phone
   - Select a contact to edit
   - Add or edit the birthday
   - Save the contact

The script runs daily and will check these birthdays, adding or updating events in your Google Calendar accordingly.

## Troubleshooting
If you encounter issues, check the Google Apps Script execution log for error messages. Ensure that your Google Calendar and Contacts permissions are correctly set.

## License
This script is released under the GPL License.

## Warranty
This software is distributed as is, and comes with ABSOLUTELY NO WARRANTY.

## Contact
For support or queries, please file an issue in the project repository.