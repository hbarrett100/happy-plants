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