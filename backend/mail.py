from config import Config
from auth import get_db_connection
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from smtplib import SMTP, SMTP_SSL
from datetime import datetime, timedelta

# šalje email
def send_gmail(my_address: str, my_password: str, my_server: str, to_address: str, if_ssl: bool = True, if_tls: bool = False, subject: str = "", body: str = ""):

    # generating email
    e_mail = MIMEMultipart()
    e_mail["From"] = my_address
    e_mail["To"] = ", ".join(to_address)
    e_mail["Subject"] = subject
    e_mail.attach(MIMEText(body))


    # sending email
    if if_ssl:
        with SMTP_SSL(my_server) as smtp:
            try:
                smtp.ehlo()
                smtp.login(my_address, my_password)
                smtp.send_message(e_mail, my_address, to_address)
                mail_sent = True
            except:
                mail_sent = False
    elif if_tls:
        with SMTP(my_server) as smtp:
            try:
                smtp.ehlo()
                smtp.starttls()
                smtp.login(my_address, my_password)
                smtp.send_message(e_mail, my_address, to_address)
                mail_sent = True
            except:
                mail_sent = False
    else:
        with SMTP(my_server) as smtp:
            try:
                smtp.ehlo()
                smtp.login(my_address, my_password)
                smtp.send_message(e_mail, my_address, to_address)
                mail_sent = True
            except:
                mail_sent = False

    if mail_sent:
        ret_message = "E-Mail sent successfully!"
    else:
        ret_message = "E-Mail failed to send!"

    return mail_sent, ret_message

# traži korisnike kojima treba poslati email podsjetnik
def send_reminder():

    subject = "Podsjetnik o rezervaciji"
    body = "Imate rezerviran termin"

    db = get_db_connection()
    now = datetime.now()
    window_start = now + timedelta(hours=23)
    window_end = now + timedelta(hours=25)
    teams = db.execute("SELECT ime_tima FROM Termin WHERE datVrPoc BETWEEN ? AND ?", (window_start.isoformat(), window_end.isoformat(),)).fetchall()

    for team in teams:
        leader = db.execute("SELECT voditelj_username FROM Tim WHERE ime_tima = ?", (team["ime_tima"],)).fetchone()
        members = db.execute("SELECT username FROM ClanTima WHERE ime_tima = ?", (team["ime_tima"],)).fetchall()
        members.append(leader)
        for member in members:
            address = db.execute("SELECT email FROM Polaznik WHERE username = ?", (member["username"],)).fetchone()
            send_gmail(my_address="breakoutsystems@gmail.com", my_password=Config.GMAIL_PASSWORD,
                       my_server="smtp.gmail.com", to_address=address, if_ssl=True, if_tls=False, subject=subject, body=body)
