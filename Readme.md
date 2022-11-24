# Notme

This is a challenge for the Hackvent 2022.

## Description

Santa brings you another free gift!  
We are happy to announce a free note taking webapp for everybody. No accout name restriction, no filtering, no restrictions and best no bugs!  
Because it cannot be hacked Santa decided to name it Notme = Not me you can hack!

Or can you?


## Vulnerability

The application is vulnerable to blind SQLI on the note update endpoint `/api/note/update`. To make it a little harder:  
- sqlmap user-agent isn't allowed
- default sqlmap exploit will override the flag

## How to setup

Install the dependencies in the root and frontend folder with `yarn`.
After that build the frontend with `yarn run build`. Then build the backend with `yarn run build`.
Configure the DB connection and the flag within the .env file.
Start the whole thing with `yarn run start`.

## Default Flag

`HV22{Sql1_is_An_0Ld_Cr4Ft}`

## Solution

Abuse the SQLI with a custom script.  
A solution script is `solution.py`. Not the fastest nor best script but hey it works
