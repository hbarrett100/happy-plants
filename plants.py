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

#Connect to Database and create database session
engine = create_engine(
                'sqlite:///plants.db',
                connect_args={'check_same_thread': False}
                )
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

    # what if url typed in by hand with invalid email - in database? valid email?
    all_plants = session.query(Plant).filter_by(email = user_email).all()
    
    user_plants_info = []
    #plant is an instance of plant object
    for plant in all_plants:
        user_plants_info.append(plant.to_json())

    return render_template('home.html', user_plants_info = user_plants_info, user_email=user_email)


#check if current user exists
@app.route("/checkuser")
def checkuser():
    print("hello checkuser route")
    user_email = request.args.get('email')
    # show message if user doesnt exist
    print(user_email)
    if user_email: 
        existing_user = session.query(Plant).filter_by(email = user_email).first()
        if existing_user:
            return 'user'
        else:
            return 'no user'

    # need to check if no email given!!
    # need to check for valid email

@app.route("/newuser")
def newuser():
    user_email = request.args.get('email')
    print(user_email)
    # show message if user doesnt exist
    if user_email: 
        existing_user = session.query(Plant).filter_by(email = user_email).first()
        if existing_user:
            return 'user already exists'
        else:
            return 'new user'


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
            print("making ",request.form.get("plant_name"))
            new_plant = Plant(email=user_email, plant=request.form.get("plant_name"), comments=request.form.get("comments"),
                    interval=request.form.get("interval"), frequency=request.form.get("frequency"), date=datetime_object)

            print("adding ",request.form.get("plant_name"))
            session.add(new_plant)

        
            print("committing ",request.form.get("plant_name"))
            session.commit()
       

            # session.query returns an array of plants
            all_plants = session.query(Plant).filter_by(email = user_email).all()

            # loop through all plants in array and convert all to json strings
            user_plants_info = []
            for plant in all_plants:
                user_plants_info.append(plant.to_json())
            print("returning", user_plants_info)
            return json.dumps(user_plants_info) 
        



# route: add event to google calendar
@app.route('/add_to_calendar', methods=['GET', 'POST'])
def add_to_calendar():
    if request.method == 'POST':
        freq = request.form.get("frequency")
        if (freq == 'weeks'):
            freq = 'WEEKLY'
        elif (freq == 'days'):
            freq = 'DAILY'

        # split datetime for google calendar format
        date, time = request.form.get("start_date").split(' ')
        start_date = date[6:10] + date[2:6] + date[:2]


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
            'RRULE:FREQ='+ freq + ';INTERVAL=' + request.form.get("interval")+';COUNT=50',
        ],
        'attendees': [
            {'email': 'hmbarrett92@gmail.com'},
            {'email': request.form.get('email')},
        ],
            'reminders': {
            'useDefault': False,
            'overrides': [
            {'method': 'email', 'minutes': 60},
            {'method': 'popup', 'minutes': 10},
            ],
        },
        }
        print(event["recurrence"])
        service = events.get_calendar()
        recurring_event = service.events().insert(calendarId='primary',sendNotifications=True, body=event).execute()

        #add event id to database. recurring_event is event object with attribute called id
        added_plant = session.query(Plant).filter_by(email=request.form.get('email'), plant=request.form.get("plant_name")).first()
        print(added_plant.to_json())
        setattr(added_plant, 'id', recurring_event.get('id'))
        session.commit()

        # print(recurring_event.get('id'))
        # print( 'Event created: %s' % (recurring_event.get('htmlLink')))
        return 'true'


# route: delete plant from db and delete event
@app.route('/remove_plant')
def remove_plant():
        #remove event from calendar
        user_email = request.args.get('email')
        plant_name = request.args.get('plant')
        plant_to_delete = session.query(Plant).filter_by(email=user_email, plant=plant_name).first()

        event_id = plant_to_delete.id
        instances = events.get_calendar().events().instances(calendarId='primary', eventId=event_id).execute()

        # Select the instance to cancel.
        instance = instances['items'][0]
        instance['status'] = 'cancelled'

        updated_instance = events.get_calendar().events().update(calendarId='primary', eventId=instance['id'], body=instance).execute()

        
        print(updated_instance['updated'])
        print('event removed from cal')

        #remove plant from database
        session.delete(plant_to_delete)
        session.commit()
        print('event removed from db')
        return 'true'




# edit entry in db and edit event

#when table is made, use jquery to save old input value before the onchange to new value
# use old value to find in database, and new value to check for unique constraint!

# @app.route('/edit_plant', methods=['GET', 'POST'])
# def edit_plant():
#     if request.method == 'POST':
#     #change format of date
#         date = request.form.get("start_date")
#         datetime_object = datetime.strptime(date, '%d-%m-%Y %H:%M:%S')

#         # get user email
#         user_email = request.form.get('email')
#         # get the plant to be edited
#         edited_plant = session.query(Plant).filter_by(email=user_email, plant=request.form.get("plant_name")).first()

#         edited_plant.plant = request.form.get("plant_name")
#         edited_plant.comments = request.form.get("comments")
#         edited_plant.interval = request.form.get("interval")
#         edited_plant.frequency = request.form.get("frequency")
#         edited_plant.date = datetime_object

#         existing_user_plant = session.query(Plant).filter_by(email=user_email, plant=request.form.get("plant_name")).first()

#     #return error if the update is a plant that already exists in the database

#         if existing_user_plant:
#             return 'unique constraint'
#         else:
#             print("editing ",request.form.get("plant_name"))
#             session.add(edited_plant)
#             session.commit()


if __name__ == '__main__':
    app.run(debug=True)






