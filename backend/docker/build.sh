cd redis-api
docker login -u joctan04
docker build -t joctan04/redis-api:latest .
docker push joctan04/redis-api:latest
cd ..