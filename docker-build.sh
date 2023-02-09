NAME=moneybook
echo 📦 Building $NAME
docker build -t $NAME --platform linux/amd64 .