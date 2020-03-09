  curl  \
  --header "Content-Type: application/json" \
  --request GET \
  --data-binary @"./get_matches.json"\
  http://localhost:5000/api/search/getMatches | python -m json.tool

