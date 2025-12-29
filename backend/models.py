from flask_login import UserMixin

class User(UserMixin):
    def __init__(self, user_data):
        self.username = user_data['username']
        self.oauth_id = user_data.get('oauth_id')
        self.uloga = user_data['uloga']

    def get_id(self):
        #Vraca username jer se tako koristi u load_user funkciji
        return str(self.username)

    def get_oauth_id(self):
        return self.oauth_id

    def get_uloga(self):
        return self.uloga

    def to_dict(self):
        return {
            "username": self.username,
            "oauth_id": self.oauth_id,
            "uloga": self.uloga
        }
