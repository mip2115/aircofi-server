  curl  \
  --header "Content-Type: application/json" \
  --header "x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTg5NzE1ZDEwODE1ODkzZjA5ZDZjNiIsImlhdCI6MTU3ODY2OTk3NCwiZXhwIjoxODc4NjY5OTc0fQ.4cXdH_a82fmtnaNDcdBnqr3k48nfwHNGjnfsyfocZQ8" \
  --request DELETE \
  --data @"./delete_image.json" \
  http://localhost:5000/api/images/deleteImage | python -m json.tool

