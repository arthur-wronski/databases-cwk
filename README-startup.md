# from databases-cwk

cd app2

docker build -t db-app .
docker run -p 3000:3000 -d --name app-cont db-app
docker network connect network app-cont

cd ../setup

chmod +x setup.sh
./setup.sh
docker network connect network mysql_container