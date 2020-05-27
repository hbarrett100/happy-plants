from flask import Flask, render_template, request, redirect, url_for
app = Flask(__name__)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, Plant

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
    user_plants_info = session.query(Plant).filter_by(email = user_email).all()
    return render_template('home.html', user_plants_info = user_plants_info)


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
    # need to check if no email given
 

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
        #get email out to use in redirect to homepage? 
        new_plant = Plant(email=request.form.get('email'), plant=request.form.get("plant_name"), comments=request.form.get("comments"),
                        interval=request.form.get("interval"), frequency=request.form.get("frequency"), date=request.form.get("start_date"))
        session.add(new_plant)
        sessio.commit()
        #need to account for user_email = request.args.get('email') in home route
        return redirect(url_for('home.html'))
        



# route: add event to google calendar



# route: delete plant from db



# route: edit entry in db

if __name__ == '__main__':
    app.run(debug=True)






