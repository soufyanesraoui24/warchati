#!/bin/bash
set -e

echo "============================================"
echo "  نشر ai-SocialMind على Oracle Cloud"
echo "============================================"

# 1. متغيرات (عدلها قبل التشغيل)
GITHUB_REPO="https://github.com/soufyanesraoui24/warchati.git"
APP_DIR="$HOME/ai-socialmind"
MONGO_DB="tajirtechdb"
DOMAIN=""  # حط domain هنا إن وجد، أو اتركه فارغاً للوصول via IP

# 2. تحديث النظام
echo "[1/8] تحديث النظام..."
sudo apt update -y && sudo apt upgrade -y

# 3. تركيب MongoDB
echo "[2/8] تركيب MongoDB..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update -y
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# 4. تركيب Node.js 22
echo "[3/8] تركيب Node.js..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 5. تركيب Ollama
echo "[4/8] تركيب Ollama..."
curl -fsSL https://ollama.com/install.sh | sh
sudo systemctl start ollama
sudo systemctl enable ollama

# 6. سحب موديل الذكاء الاصطناعي
echo "[5/8] سحب موديل qwen2.5:7b (4.5 GB)..."
ollama pull qwen2.5:7b

# 7. سحب المشروع
echo "[6/8] سحب المشروع من GitHub..."
git clone $GITHUB_REPO $APP_DIR
cd $APP_DIR

# 8. إنشاء ملف البيئة
echo "[7/8] إعداد البيئة..."
cat > backend/.env << EOF
NODE_ENV=production
DATABASE_URL="mongodb://127.0.0.1:27017/$MONGO_DB"
PORT=5000
JWT_SECRET="$(openssl rand -base64 32)"

# Ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
OLLAMA_TIMEOUT_MS=30000

# Google OAuth (عدل لو عندك domain)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_CALLBACK_URL="http://localhost:5000/api/auth/google/callback"

# Facebook
PAGE_ACCESS_TOKEN=""
VERIFY_TOKEN=""

# Frontend
FRONTEND_URL="http://localhost:5000"
EOF

# 9. تركيب الاعتماديات وبناء الواجهة
echo "[8/8] تركيب الاعتماديات وبناء الواجهة..."
cd $APP_DIR/backend && npm install
cd $APP_DIR/frontend && npm install && npm run build

# 10. تشغيل السيرفر عبر PM2
echo "تشغيل السيرفر..."
sudo npm install -g pm2 pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 7
cd $APP_DIR/backend
NODE_ENV=production pm2 start server.js --name ai-socialmind
pm2 save
sudo env PATH=\$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

# 11. تركيب Nginx (للـ domain و SSL)
echo "تركيب Nginx..."
sudo apt install -y nginx
if [ -n "$DOMAIN" ]; then
    cat > /tmp/ai-socialmind << NGINX
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_read_timeout 86400;
    }
}
NGINX
    sudo mv /tmp/ai-socialmind /etc/nginx/sites-available/ai-socialmind
    sudo ln -sf /etc/nginx/sites-available/ai-socialmind /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo systemctl reload nginx

    # Certbot لـ SSL
    sudo apt install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN || echo "⚠️ Certbot فشل، ركّب SSL يدوياً بعدين"
else
    echo "⚠️ ما حطيتيش domain. السيرفر يشتغل على http://IP:5000"
    echo "  عبي DOMAIN في السكريبت واعد التشغيل عشان Nginx"
fi

# 12. فتح المنفذ في جدار الحماية
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow ssh
sudo ufw --force enable

# 13. معلومات التنصيب
IP=$(curl -s ifconfig.me)
echo ""
echo "============================================"
echo "  ✅ تم النشر بنجاح!"
echo "============================================"
echo ""
if [ -n "$DOMAIN" ]; then
    echo "  العنوان:   https://$DOMAIN"
else
    echo "  العنوان:   http://$IP:5000"
fi
echo "  API:       http://$IP:5000/health"
echo ""
echo "  MongoDB:   mongodb://127.0.0.1:27017/$MONGO_DB"
echo "  Ollama:    http://localhost:11434"
echo "  PM2:       pm2 status (لرؤية حالة السيرفر)"
echo ""
echo "  📝 عدّل البيئة: nano $APP_DIR/backend/.env"
echo "     وغير GOOGLE_CLIENT_ID و FRONTEND_URL"
echo "     إذا عندك domain"
echo "============================================"