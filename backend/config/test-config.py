import unittest
import os
from unittest.mock import patch
from config_postgres import Config  # adjust the import to match your project structure

class TestConfig(unittest.TestCase):
    @patch.dict(os.environ, {"DATABASE_URL": "postgresql://test_url", "SECRET_KEY": "unit-test-secret"}, clear=True)
    def test_config_loads_env_vars(self):
        # Asserts that Config reads env variables correctly
        self.assertEqual(Config.SQLALCHEMY_DATABASE_URI, "postgresql://test_url")
        self.assertEqual(Config.SECRET_KEY, "unit-test-secret")
        self.assertFalse(Config.SQLALCHEMY_TRACK_MODIFICATIONS)

    @patch.dict(os.environ, {}, clear=True)
    def test_config_fallback(self):
        # Simulate no environment variables set
        # Provide database_url variable from your global/module scope as fallback
        # The test passes if fallback value is used
        fallback_url = "fallback://url"
        # Monkey-patch database_url for this test
        from config_postgres import database_url as module_database_url
        # You may need to patch this if it's used inside the class as in your code
        self.assertEqual(Config.SQLALCHEMY_DATABASE_URI, module_database_url)
        self.assertEqual(Config.SECRET_KEY, "dev-secret")
