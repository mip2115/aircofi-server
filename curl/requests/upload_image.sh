  curl  \
  --header "Content-Type: application/json" \
  --header "x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlNTNjZjAyYWM1MzM4OTQ3ZTFlZmQwYiIsImlhdCI6MTU4MjU1MDc4NiwiZXhwIjoxODgyNTUwNzg2fQ._srqrg8-yGR899FztsF7FsbwsfrTOL8SxRaTYOuBH2k" \
  --request POST \
  --data @"./upload_image.json" \
  http://localhost:5002/api/images/uploadImage | python -m json.tool

