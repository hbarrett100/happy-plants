import sys
import json
#for creating the mapper code
from sqlalchemy import Column, Integer, String, DateTime

#for configuration and class code
from sqlalchemy.ext.declarative import declarative_base

#for configuration
from sqlalchemy import create_engine

#create declarative_base instance
Base = declarative_base()

# create the plants class which inherits from the base class
class Plant(Base):
   __tablename__ = 'plants'

   email = Column(String(100), nullable=False, primary_key=True)
   plant = Column(String(250), nullable=False, primary_key=True)
   comments = Column(String(250))
   interval = Column(String(20))
   frequency = Column(Integer)
   date = Column(DateTime)
   id = Column(String(50))

   # convert to JSON to send back to front end
   def to_json(self):
      plant_dict = {
         "plant": self.plant,
         "comments": self.comments,
         "interval": self.interval,
         "frequency": self.frequency,
         "date": '{:%d/%m/%Y}'.format(self.date),
         "id": self.id
      }

      return json.dumps(plant_dict)

      #add repr that returns json

#creates a create_engine instance at the bottom of the file
if __name__ == "__main__":
   engine = create_engine('sqlite:///plants.db', echo=True)
   Base.metadata.create_all(engine)