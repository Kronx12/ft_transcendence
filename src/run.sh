#!/bin/sh

cd /var/www/ft_transcendence-back/ && npm install && npm run start:dev &
cd /var/www/ft_transcendence-front/ && npm install && npm run serve & 
sleep infinity



curl -X POST --data "grant_type=client_credentials&client_id=24505a193a1387501b4477352c3a949680f317d28f3354226ed21b6f294d3f13&client_secret=f62a24bf3e2a8320a6db516ed48aa80696b4c539e19c46537f4948fa48a9f884" https://api.intra.42.fr/oauth/token

curl -H "Authorization: Bearer a7d6f171cc206b1475ab58f7ab4b4552055cd5680544e2f3bb32b15af29b3e85" https://api.intra.42.fr/v2/me

curl -F grant_type=authorization_code \
-F client_id=24505a193a1387501b4477352c3a949680f317d28f3354226ed21b6f294d3f13 \
-F client_secret=f62a24bf3e2a8320a6db516ed48aa80696b4c539e19c46537f4948fa48a9f884 \
-F code=74925555f8e497831f476f87c08886aceef6129868f8469ccb553833ee9a78da \
-F redirect_uri=http://localhost/login \
-X POST https://api.intra.42.fr/oauth/token