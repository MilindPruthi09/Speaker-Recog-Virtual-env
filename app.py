from distutils.log import debug
import os
import re
import mysql.connector
from flask import Flask, render_template, request
from flask_mysqldb import MySQL
from flask_mysqldb import MySQL;
import mysql

app = Flask(__name__)

db = MySQL(app);

#conn = mysql.connector.connect(user='root', password='BTWin123!', host='127.0.0.1', database='world')

def executeQuery(query,values):
	conn = mysql.connector.connect(user='root', password='BTWin123!', host='127.0.0.1', database='world')
	cursor = conn.cursor()
	cursor.execute(query, values)
	conn.commit()
	cursor.close()

@app.route('/enroll')
def enroll():
    return render_template("enroll.html")

@app.route('/verify')
def verify():
    return render_template("verify.html")

@app.route("/insertID")
def params():
    profileID=request.args.get("profileID")
    userName=request.args.get("uname")
    emailID=request.args.get("emailid")
    values=[profileID,userName,emailID]
    query="INSERT INTO employee(profileID,NAME,emailID) VALUES(%s,%s,%s)"
    executeQuery(query,values)
    return "I"

@app.route("/emailID")
def emailID():
	conn = mysql.connector.connect(user='root', password='BTWin123!', host='127.0.0.1', database='world')
	cursor = conn.cursor()
	emailID=request.args.get("emailID")
	query="SELECT COUNT(emailID) FROM EMPLOYEE WHERE emailID=%s"
	values=[emailID,]
	cursor.execute(query,values)
	result=cursor.fetchone()
	cnt=result[0]
	result=str(cnt)
	return result

@app.route("/validID")
def validID():
	emailID=request.args.get("emailID")
	pat = '([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+'
	if re.match(pat,emailID):
		return "True"
	return "False"

@app.route("/fetchID")
def fetch():
	conn = mysql.connector.connect(user='root', password='BTWin123!', host='127.0.0.1', database='world')
	cursor = conn.cursor()
	emailID=request.args.get("emailID")
	query="""SELECT profileID,NAME FROM employee WHERE emailID=%s"""
	cursor.execute(query, (emailID,))
	result=cursor.fetchone()
	profileID=result[0]
	userName=result[1]
	cursor.close()
	return profileID+","+userName

if __name__ == '__main__':
    app.run(host=os.environ.get('IP'),
			port=int(os.environ.get('PORT','5000')),
			debug=True)