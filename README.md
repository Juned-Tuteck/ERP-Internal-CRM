ERP-Internal-CRM
TuTeck

# crm ui deployment

docker buildx build -t contromoist-revamp-ui-crm-image .
docker  save -o ./contromoist-revamp-ui-crm-image.tar contromoist-revamp-ui-crm-image

docker load -i contromoist-revamp-ui-crm-image.tar
docker run -d -p 7321:7321 --env-file .env --name contromoist-revamp-ui-crm-container contromoist-revamp-ui-crm-image

------------

scp "C:\Users\sk.juned\Documents\ERP-Internal-CRM\contromoist-revamp-ui-crm-image.tar" contromoist_dev@103.127.31.183:~/revamp/frontend

scp "C:\Users\sk.juned\Documents\ERP-Internal-CRM\.env" contromoist_dev@103.127.31.183:~/revamp/frontend

yrf$ww2$667