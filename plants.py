from flask import Flask, render_template, request, redirect, url_for
app = Flask(__name__)

# posts = [
#     {
#         'author': 'hannah',
#         'title': 'plants app practise 1',
#     },
#         {
#         'author': 'hannah',
#         'title': 'plants app practise 2',
#     }

# ]

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
    print("hello")
    user_email = request.args.get('email')
    # show message if user doesnt exist
    print(user_email)
    if user_email: 
        existing_user = session.query(Plant).filter_by(email = user_email).first()
        if existing_user:
            return 'true'
        else:
            return 'false'
    # what if not user_email?




# check for valid email

# @app.route("/newuser")
# def newuser():
#     user_email = request.args.get('email')
#     # show message if user doesnt exist
#     if email: 
#         existing_user = session.query(Plant).filter_by(user_email = email).first()
#         if existing_user:
#             return make_response(f'{email} already exists.')
#         else
#             return redirect(url_for("home"))


# # create new plant
# @app.route('/new_plant', methods=['GET', 'POST'])
# def new_plant():
#     if request.method == 'POST':

#         new_plant = Plant(email=request.form["email"], plant=request.form["plantname"], comments=request.form["comments"],
#                         interval=request.form["interval"], frequency=request.form["frequency"], date=request.form["start date"])


# add event to google calendar



if __name__ == '__main__':
    app.run(debug=True)






