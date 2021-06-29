#!/bin/sh

cd ./ft_transcendence-back/ && npm install && npm run start:dev &
cd ./ft_transcendence-front/ && npm install && npm run serve & 
sleep infinity
