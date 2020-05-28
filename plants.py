from flask import Flask, render_template, request, redirect, url_for
app = Flask(__name__)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, Plant
from datetime import datetime
import json

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

        #create new plant object
        print("making ",request.form.get("plant_name"))
        new_plant = Plant(email=user_email, plant=request.form.get("plant_name"), comments=request.form.get("comments"),
                        interval=request.form.get("interval"), frequency=request.form.get("frequency"), date=datetime_object)

        print("adding ",request.form.get("plant_name"))
        session.add(new_plant)

        #will throw error if plant not new
        #add conditional to return error to front end if plant not new and to add it if it is new
        print("committing ",request.form.get("plant_name"))
        session.commit()
       

        #session.query returns an array of plants
        all_plants = session.query(Plant).filter_by(email = user_email).all()

        # loop through all plants in array and convert all to json strings
        user_plants_info = []
        for plant in all_plants:
            user_plants_info.append(plant.to_json())
        print("returning", user_plants_info)
        return json.dumps(user_plants_info) #return array of json strings
        



# route: add event to google calendar



# route: delete plant from db



# route: edit entry in db

if __name__ == '__main__':
    app.run(debug=True)






