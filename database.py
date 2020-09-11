import sys
import json
#for creating the mapper code
from sqlalchemy import Column, Integer, String, DateTime
import os
basedir = os.path.abspath(os.path.dirname(__file__))

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

   # convert to dict to send back to front end
   def to_dict(self):
      plant_dict = {
         "plant": self.plant,
         "comments": self.comments,
         "frequency": f'{self.frequency} {self.interval}',
         "date": '{:%d/%m/%Y}'.format(self.date),
         "time": '{:%H:%M:%S}'.format(self.date),
         "id": self.id
      }

      return plant_dict
   
   def to_json(self):
      return json.dumps(self.to_dict())


#creates a create_engine instance at the bottom of the file
if __name__ == "__main__":
   # DATABASE_URI = 'postgres+psycopg2://postgres:password@localhost:5432/plants'

   SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL']

   engine = create_engine(SQLALCHEMY_DATABASE_URI, echo=True)
   Base.metadata.create_all(engine)