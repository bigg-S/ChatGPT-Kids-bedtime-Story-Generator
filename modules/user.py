from flask_login import UserMixin
import json

from modules.database_initializer import DatabaseInitializer

database_initializer = DatabaseInitializer()

class User(UserMixin):
    def __init__(self, id_, name, email, stories):
        self.id = id_
        self.name = name
        self.email = email
        self.stories = stories

    @staticmethod
    def get(user_id):
        db = database_initializer.get_database_connection()
        cursor = db.cursor()
        cursor.execute(
            "SELECT unique_id, name, email, COALESCE(stories, '{}'::jsonb[]) AS stories FROM users WHERE unique_id = %s", (user_id,)
        )
        user = cursor.fetchone()
        cursor.close()
        if not user:
            return None

        return User(
            id_=user[0], name=user[1], email=user[2], stories=user[3]
        )


    @staticmethod
    def create(id_, name, email, stories):
        db = database_initializer.get_database_connection()
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO users (unique_id, name, email, stories) "
            "VALUES (%s, %s, %s, %s)",
            (id_, name, email, stories),
        )
        db.commit()
        cursor.close()
        

    # commit changes
    def save(self):
        db = database_initializer.get_database_connection()
        cursor = db.cursor()
        
        # Prepare the JSON array for casting to a PostgreSQL array
        cursor.execute("""
            WITH a AS (
                SELECT jsonb_array_elements_text(%s) e
            )
            , b AS (
                SELECT array_agg(e)::jsonb[] ag FROM a
            )
            UPDATE users 
            SET stories = ag
            FROM b
            WHERE unique_id = %s;
        """, (json.dumps(self.stories), self.id))
        
        db.commit()
        cursor.close()



