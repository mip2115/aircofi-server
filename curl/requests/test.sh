  curl  \
  --header "Content-Type: application/json" \
  --request GET \
  http://localhost:5000/api/user/test | python -m json.tool

