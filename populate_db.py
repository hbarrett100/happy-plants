from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Plant, Base
import datetime

d = datetime.datetime(2020, 5, 25, 18)

engine = create_engine('sqlite:///plants.db')

# Bind the engine to the metadata of the Base class so that the
# declaratives can be accessed through a DBSession instance
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
# A DBSession() instance establishes all conversations with the database
# and represents a "staging zone" for all the objects loaded into the
# database session object.
session = DBSession()

test_plant = Plant(email="cshort@tcd.ie", plant="elephant plant", comments="direct sunlight",
interval="weeks", frequency=2, date=d)

session.add(test_plant)
session.commit()