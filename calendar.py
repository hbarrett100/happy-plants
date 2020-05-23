from __future__ import print_function
import datetime
import pickle
import os.path
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/calendar.events']


def get_calendar():
    """Shows basic usage of the Google Calendar API.
    Prints the start and name of the next 10 events on the user's calendar.
    """
    creds = None
    # The file token.pickle stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    service = build('calendar', 'v3', credentials=creds)
    return service
    # Call the Calendar API
    # now = datetime.datetime.utcnow().isoformat() + 'Z' # 'Z' indicates UTC time
    # print('Getting the upcoming 10 events')
    # events_result = service.events().list(calendarId='primary', timeMin=now,
    #                                     maxResults=10, singleEvents=True,
    #                                     orderBy='startTime').execute()
    # events = events_result.get('items', [])

    # if not events:
    #     print('No upcoming events found.')
    # for event in events:
    #     start = event['start'].get('dateTime', event['start'].get('date'))
    #     print(start, event['summary'])



def create_event(email, plant):

    # change format of freq
    if (plant['freq'] == 'weeks'):
        plant['freq'] = 'WEEKLY'
    elif (plant['freq'] == 'days'):
        plant['freq'] = 'DAILY'

    # end time of event one hour after start time
    end_time = str(int(plant['time'][:2])+1) + ':00:00'

    event = {
    'summary': 'Water ' + plant['plant_name'],
    'location': 'N/A',
    'start': {
        'dateTime': plant['start_date'] + 'T' + plant['time'],
        'timeZone': 'Europe/Zurich'
    },
    'end': {
        'dateTime': plant['start_date'] + 'T' + end_time,
        'timeZone': 'Europe/Zurich'
    },
    'recurrence': [
        'RRULE:FREQ=' + plant['freq'] + ';INTERVAL=' + plant['interval'] + ';COUNT=50',
    ],
    'attendees': [
        {'email': 'hmbarrett92@gmail.com'},
        {'email': email},
    ],
        'reminders': {
        'useDefault': False,
        'overrides': [
        {'method': 'email', 'minutes': 60},
        {'method': 'popup', 'minutes': 10},
        ],
    },
    }

    service = get_calendar()
    recurring_event = service.events().insert(calendarId='primary',sendNotifications=True, body=event).execute()
    print( 'Event created: %s' % (recurring_event.get('htmlLink')))

# dictionary of plants
plant_event = {'email': 'cshort@tcd.ie', 
                'plants':[{'plant_name': 'Aloe Vera', 'start_date': '2020-05-24', 'interval': '2', 'freq': 'weeks', 'time': '18:00:00'},
                {'plant_name': 'Elephant', 'start_date': '2020-05-24', 'interval': '1', 'freq': 'weeks', 'time': '17:00:00'}]}

#call function for each plant in array
for plant in plant_event['plants']:
    create_event(plant_event['email'], plant)
    # print(plant)