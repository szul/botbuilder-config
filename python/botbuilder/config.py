import json

class BotConfig:
    def __init__(self, bot_file_path, secret):
        self.bot_file_path = bot_file_path
        self.secret = secret
        self._encryptedProperties = {
            "endpoint": ["appPassword"],
            "abs": ["appPassword"],
            "luis": ["authoringKey", "subscriptionKey"],
            "qna": ["subscriptionKey"],
            "dispatch": ["authoringKey", "subscriptionKey"]
        }
        self.name = None
        self.description = None
        self.secretKey = None
        self.services = []
        self._algorithm = "aes192"
        self._base64 = "hex"
        self._ascii = "utf8"

        bot_file = self.parse_bot_file()

    def parse_bot_file(self):
        return self
