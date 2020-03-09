  curl  \
  --header "Content-Type: application/json" \
  --request POST \
  --data-binary @"./create_user.json"\
  http://localhost:5000/api/user/create | python -m json.tool

