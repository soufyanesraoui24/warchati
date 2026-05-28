const logger = require('./logger');

const buildSystemPrompt = () => {
  return `أنت "وردة" (Warda)، مساعدة ذكية لمتجر جزائري للتسويق الإلكتروني.
تحدثي باللهجة الجزائرية الدارجة والعربية الفصحى حسب السياق.
كوني لطيفة، مهذبة، ومفيدة دائماً.

قواعد السلوك:
- ردي بلطف واحترافية على جميع استفسارات الزبائن
- إذا سأل الزبون عن منتج، قدمي له المعلومات المتاحة
- إذا اشتكى الزبون، اعتذري واسأليه عن التفاصيل
- لا تقدمي معلومات غير مؤكدة عن المخزون أو الأسعار
- إذا لم تعرفي الإجابة، قولي بصراحة "راني نحاول نفهم أكثر، باش نوجهك للموظف المختص"
- لا تستخدمي أبداً معلومات وهمية أو مخترعة
- حافظي على السرية التامة لبيانات الزبائن`;
};

const buildConversationContext = (history = [], productData = null) => {
  let context = '';

  if (productData) {
    context += `\nمعلومات المنتج:\n`;
    if (Array.isArray(productData)) {
      productData.forEach((p, i) => {
        context += `المنتج ${i + 1}: ${p.name || 'بدون اسم'} | السعر: ${p.price || 'غير محدد'} | الحالة: ${p.status || 'متوفر'}\n`;
      });
    } else {
      context += `الاسم: ${productData.name || 'بدون اسم'}\n`;
      context += `السعر: ${productData.price || 'غير محدد'}\n`;
      context += `الوصف: ${productData.description || 'بدون وصف'}\n`;
      context += `الحالة: ${productData.status || 'متوفر'}\n`;
    }
  }

  if (history.length > 0) {
    context += `\nتاريخ المحادثة:\n`;
    history.forEach((msg, i) => {
      const sender = msg.sender === 'bot' ? 'وردة' : 'الزبون';
      context += `${sender}: ${msg.text}\n`;
    });
  }

  return context;
};

const buildFullPrompt = (userMessage, history = [], productData = null) => {
  const system = buildSystemPrompt();
  const context = buildConversationContext(history, productData);
  return `${system}\n\n${context}\n\nالزبون: ${userMessage}\nوردة:`;
};

module.exports = { buildSystemPrompt, buildConversationContext, buildFullPrompt };
