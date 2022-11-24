#!/bin/bash
echo "postgres" > /tmp/password
initdb -U postgres -D /tmp/data -A password --pwfile /tmp/password 
pg_ctl -D /tmp/data -l logfile start

export PGPASSWORD=postgres
psql -U postgres postgres -c "create database notme;"

node dist/index.js