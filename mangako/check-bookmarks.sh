#!/bin/bash

echo "🔍 فحص شامل لمشكلة المفضلات"
echo "================================="
echo ""

# 1. فحص TypeScript
echo "1️⃣ فحص TypeScript..."
npx tsc --noEmit 2>&1 | grep -i "error" | head -5
if [ $? -eq 0 ]; then
    echo "   ❌ وجدت أخطاء TypeScript"
else
    echo "   ✅ لا توجد أخطاء TypeScript"
fi
echo ""

# 2. فحص ملف actions.ts
echo "2️⃣ فحص actions.ts..."
if grep -q "getCurrentUser" src/app/actions.ts; then
    echo "   ✅ getCurrentUser موجود في actions.ts"
else
    echo "   ❌ getCurrentUser غير موجود في actions.ts"
fi
echo ""

# 3. فحص auth-helpers.ts
echo "3️⃣ فحص auth-helpers.ts..."
if grep -q "export async function getCurrentUser" src/lib/auth-helpers.ts; then
    echo "   ✅ getCurrentUser موجود في auth-helpers"
else
    echo "   ❌ getCurrentUser غير موجود في auth-helpers"
fi
echo ""

# 4. فحص Database
echo "4️⃣ فحص Database schema..."
if [ -f "prisma/schema.prisma" ]; then
    if grep -q "model Bookmark" prisma/schema.prisma; then
        echo "   ✅ Bookmark model موجود"
    else
        echo "   ❌ Bookmark model غير موجود"
    fi
else
    echo "   ❌ schema.prisma غير موجود"
fi
echo ""

# 5. فحص آخر سجلات
echo "5️⃣ آخر السجلات من server-debug.log:"
if [ -f "server-debug.log" ]; then
    echo "   ---"
    tail -5 server-debug.log | sed 's/^/   /'
    echo "   ---"
else
    echo "   ℹ️  لا يوجد ملف سجلات بعد"
fi
echo ""

# 6. فحص الـ dev server
echo "6️⃣ حالة التطبيق:"
if lsof -i :3000 > /dev/null 2>&1; then
    echo "   ✅ التطبيق يعمل على المنفذ 3000"
else
    echo "   ⚠️  التطبيق غير يعمل على المنفذ 3000"
fi
echo ""

echo "================================="
echo "✨ انتهى الفحص!"
echo ""
echo "📋 الخطوة التالية:"
echo "1. افتح http://localhost:3000"
echo "2. سجل الدخول"
echo "3. جرب إضافة مفضلة"
echo "4. افتح F12 → Console لرؤية أي أخطاء"
echo ""
