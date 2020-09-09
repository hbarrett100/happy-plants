from flask import Flask, render_template, request, redirect, url_for
app = Flask(__name__)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, Plant
from datetime import datetime
import json
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import events
import os
basedir = os.path.abspath(os.path.dirname(__file__))

#Connect to Database and create database session
# DATABASE_URI = 'postgres+psycopg2://postgres:password@localhost:5432/plants'

SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL']
# DATABASE_URI = f'postgres+psycopg2://{SQLALCHEMY_DATABASE_URI}/plants'
engine = create_engine(SQLALCHEMY_DATABASE_URI)
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
session = DBSession()


#login page
@app.route('/')
@app.route('/login')
def login():
    return render_template('login.html')


# home page showing all plants for that user
@app.route("/home")
def home():
    user_email = request.args.get('email')
    all_plants = session.query(Plant).filter_by(email = user_email).all()
    user_plants_info = []
    #plant is an instance of plant object
    for plant in all_plants:
        user_plants_info.append(plant.to_dict())

    return render_template('home.html', user_plants_info = user_plants_info, user_email=user_email)


# add new plant to database
@app.route('/new_plant', methods=['GET', 'POST'])
def new_plant():
    if request.method == 'POST':
        #change format of date
        date = request.form.get("start_date")
        datetime_object = datetime.strptime(date, '%d-%m-%Y %H:%M:%S')

        # get user email
        user_email = request.form.get('email')

        # if user has already entered that plant, it will be a unique constraint. Display message to user.
        # else add new plant to database
        existing_user_plant = session.query(Plant).filter_by(email=user_email, plant=request.form.get("plant_name")).first()
        if existing_user_plant:
            return 'unique constraint'
        else:
            new_plant = Plant(email=user_email, plant=request.form.get("plant_name"), comments=request.form.get("comments"),
                    interval=request.form.get("interval"), frequency=request.form.get("frequency"), date=datetime_object)
            session.add(new_plant)
            session.commit()
       
            # session.query returns an array of plants
            all_plants = session.query(Plant).filter_by(email = user_email).all()

            # loop through all plants in array and convert all to json strings
            user_plants_info = []
            for plant in all_plants:
                user_plants_info.append(plant.to_json())
            return json.dumps(user_plants_info) 
        
# route: add event to google calendar
@app.route('/add_to_calendar', methods=['GET', 'POST'])
def add_to_calendar():
    if request.method == 'POST':
        interval = request.form.get("interval")
        if (interval == 'weeks' or interval == 'week'):
            interval = 'WEEKLY'
        elif (interval == 'days' or interval == 'day'):
            interval = 'DAILY'

        # split datetime for google calendar format
        date, time = request.form.get("start_date").split(' ')
        start_date = date[6:10] + date[2:6] + date[:2]

        #set until for recurrence rule
        year, month, date = start_date.split('-')
        year_until = int(year)+1
        time_until = time.replace(":","")
        until = f"{year_until}{month}{date}T{time_until}Z"


        # end time of event one hour after start time
        end_time = str(int(time[:2])+1) + ':00:00'

        event = {
        'summary': 'Water ' + request.form.get("plant_name"),
        'location': 'N/A',
        'start': {
            'dateTime': start_date + 'T' + time,
            'timeZone': 'Europe/Zurich'
        },
        'end': {
            'dateTime': start_date + 'T' + end_time,
            'timeZone': 'Europe/Zurich'
        },
        'recurrence': [
            'RRULE:FREQ='+ interval + ';INTERVAL=' + request.form.get("frequency")+';UNTIL='+until,
        ],
        'attendees': [
            {'email': 'hmbarrett92@gmail.com'},
            {'email': request.form.get('email')},
        ],
            'reminders': {
            'useDefault': False,
            'overrides': [
            {'method': 'popup', 'minutes': 10},
            ],
        },
        }
        service = events.get_calendar()
        recurring_event = service.events().insert(calendarId='primary',sendNotifications=True, body=event).execute()

        #add event id to database. recurring_event is event object with attribute called id
        added_plant = session.query(Plant).filter_by(email=request.form.get('email'), plant=request.form.get("plant_name")).first()
        setattr(added_plant, 'id', recurring_event.get('id'))
        session.commit()
        return 'true'


# route: delete plant from db and delete event
@app.route('/remove_plant', methods=['GET', 'POST'])
def remove_plant():
    if request.method == 'POST':
        #remove event from calendar
        user_email = request.form.get("email")
        plant_name = request.form.get("plant_name")
        plant_to_delete = session.query(Plant).filter_by(email=user_email, plant=plant_name).first()
        event_id = plant_to_delete.id
        updated_instance = events.get_calendar().events().delete(calendarId='primary', eventId=event_id, sendUpdates='all').execute()

        #remove plant from database
        session.delete(plant_to_delete)
        session.commit()
        return 'true'

if __name__ == '__main__':
    app.run(debug=True)






