from config import Config
from app import get_db_connection
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from smtplib import SMTP, SMTP_SSL
from datetime import datetime, timedelta
from email.mime.base import MIMEBase
from email import encoders
from icalendar import Calendar, Event
from zoneinfo import ZoneInfo


def create_ics(start_dt, duration_minutes):
    cal = Calendar()
    cal.add('prodid', '-//ICS//EN')
    cal.add('version', '2.0')

    event = Event()
    event.add('summary', 'Rezervirani termin')
    event.add('dtstart', start_dt)
    event.add('dtend', start_dt + timedelta(minutes=duration_minutes))
    event.add('description', 'Podsjetnik na rezervirani termin')
    event.add('uid', 'BreakoutSystems0')

    cal.add_component(event)
    return cal.to_ical()

# šalje email
def send_gmail(my_address: str,
               my_password: str,
               my_server: str,
               to_address: str,
               if_ssl: bool = True,
               if_tls: bool = False,
               subject: str = "",
               body: str = "",
               ics_data: bytes | None = None):

    # generating email
    e_mail = MIMEMultipart()
    e_mail["From"] = my_address
    e_mail["To"] = ", ".join(to_address)
    e_mail["Subject"] = subject
    e_mail.attach(MIMEText(body))

    if ics_data:
        ics_part = MIMEBase("text", "calendar", method="REQUEST", name="event.ics")
        ics_part.set_payload(ics_data)
        encoders.encode_base64(ics_part)

        ics_part.add_header(
            "Content-Disposition",
            "attachment; filename=event.ics"
        )

        e_mail.attach(ics_part)


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
        start_dt = datetime.fromisoformat(team["datVrPoc"]).replace(
            tzinfo=ZoneInfo("Europe/Zagreb")
        )

        ics_data = create_ics(start_dt, duration_minutes=60)

        leader = db.execute("SELECT voditelj_username FROM Tim WHERE ime_tima = ?", (team["ime_tima"],)).fetchone()
        members = db.execute("SELECT username FROM ClanTima WHERE ime_tima = ?", (team["ime_tima"],)).fetchall()
        members.append(leader)
        for member in members:
            address = db.execute("SELECT email FROM Polaznik WHERE username = ?", (member["username"],)).fetchone()
            send_gmail(
                my_address="breakoutsystems@gmail.com",
                my_password=Config.GMAIL_PASSWORD,
                my_server="smtp.gmail.com",
                to_address=address["email"],
                if_ssl=True,
                subject=subject,
                body=body,
                ics_data=ics_data
            )