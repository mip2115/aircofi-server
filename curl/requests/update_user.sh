  curl  \
  --header "Content-Type: application/json" \
  --header "x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTY5Y2IwMmY0MjRlNTAzZTVhZTQzZiIsImlhdCI6MTU3ODU5MzcwNiwiZXhwIjoxODc4NTkzNzA2fQ.u1ENSjFQTTwBgnRNy-UZQJlO9o2mzX-xStkgyCMU8PQ" \
  --request POST \
  --data-binary @"./update_user.json" \
  http://localhost:5000/api/user/updateInfo | python -m json.tool

