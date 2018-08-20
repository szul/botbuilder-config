import json

class BotConfig(object):
    def __init__(self, options):
        if options is None:
            options = {}
        self.options = options
        self._encrypted_properties = {
            "endpoint": ["appPassword"],
            "abs": ["appPassword"],
            "luis": ["authoringKey", "subscriptionKey"],
            "qna": ["subscriptionKey"],
            "dispatch": ["authoringKey", "subscriptionKey"]
        }
        self.name = None
        self.description = None
        self.secret_key = None
        self.services = []
        self._algorithm = "aes192"
        self._base64 = "hex"
        self._ascii = "utf8"

        bot_file = self.parse_bot_file()
        for k in bot_file:
            self[k] = bot_file[k]

    def parse_bot_file(self):
        return self
