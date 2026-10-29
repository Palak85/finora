import os
import pymysql
from django.core.management.base import BaseCommand
from dotenv import load_dotenv

load_dotenv()


class Command(BaseCommand):
    help = 'Creates the MySQL database if it does not already exist'

    def handle(self, *args, **options):
        db_name = os.getenv('DB_NAME', 'finora_db')
        db_user = os.getenv('DB_USER', 'root')
        db_password = os.getenv('DB_PASSWORD', '')
        db_host = os.getenv('DB_HOST', '127.0.0.1')
        db_port = int(os.getenv('DB_PORT', '3306'))

        self.stdout.write(f"Connecting to MySQL server at {db_host}:{db_port} as '{db_user}'...")
        try:
            conn = pymysql.connect(
                host=db_host,
                user=db_user,
                password=db_password,
                port=db_port,
                charset='utf8mb4'
            )
            with conn.cursor() as cursor:
                cursor.execute(
                    f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
                )
            conn.close()
            self.stdout.write(self.style.SUCCESS(f"✅ MySQL Database '{db_name}' is ready!"))
        except pymysql.err.OperationalError as e:
            self.stdout.write(self.style.ERROR(f"❌ MySQL connection failed: {e}"))
            self.stdout.write(self.style.WARNING("Please check your DB_PASSWORD and DB_USER in backend/.env"))

