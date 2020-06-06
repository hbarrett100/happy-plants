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


plants = session.query(Plant).all()

for plant in plants:
    print(plant.to_json())

# start_date = '30-05-2020 18:00:00'
# date, time = start_date.split(' ')
# print(date)
# print(time)
# end_time = str(int(time[:2])+1) + ':00:00'
# print(end_time)

# start_date = date[6:10] + date[2:6] + date[:2]
# print(start_date)