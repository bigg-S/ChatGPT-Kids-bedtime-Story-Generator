from flask_login import UserMixin

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
        user = db.execute(
            "SELECT * FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        if not user:
            return None

        return User(
            id_=user[0], name=user[1], email=user[2], stories=user[3]
        )

    @staticmethod
    def create(id_, name, email):
        db = database_initializer.get_database_connection()
        db.execute(
                "INSERT INTO users (id, name, email) "
                "VALUES (?, ?, ?)",
                (id_, name, email),
            )
        db.commit()
            

    # commit changes
    def save(self):
        db = database_initializer.get_database_connection()
        db.execute(
            "UPDATE users SET stories = ? WHERE id = ?",
            (self.stories, self.id),
        )
        db.commit()
