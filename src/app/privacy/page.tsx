'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './privacy.module.css';
import schoolDetails from '@/json/schooldetails';

const PrivacyPolicy = () => {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('language') as 'en' | 'hi' | null;
      if (saved && (saved === 'en' || saved === 'hi')) {
        setLanguage(saved);
      }
    } catch (e) {
      // localStorage not available
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
    try {
      localStorage.setItem('language', newLang);
    } catch (e) {
      // localStorage not available
    }
  };

  const content = {
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last Updated: January 2026',
      sections: [
        {
          heading: '1. Introduction',
          content: `At ${schoolDetails.name}, we are committed to protecting your privacy and ensuring you have a positive experience on our website. This Privacy Policy outlines how we collect, use, and safeguard your information when you visit our website and interact with us.`
        },
        {
          heading: '2. Information We Collect',
          content: `We may collect information about you in a variety of ways. The information we may collect on the Site includes:

• Personal Data: Name, email address, phone number, postal address, date of birth
• Device Information: IP address, browser type, operating system
• Usage Information: Pages visited, time spent on pages, links clicked
• Admission Information: Educational background, parent/guardian details, health information`
        },
        {
          heading: '3. How We Use Your Information',
          content: `We use the information we collect in the following ways:

• To process admission applications and maintain student records
• To communicate with parents/guardians regarding school activities
• To improve our website and services
• To send promotional emails and updates (with your consent)
• To comply with legal obligations
• To protect against fraud and ensure security`
        },
        {
          heading: '4. Data Security',
          content: `We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Our website uses SSL encryption to protect sensitive information during transmission.`
        },
        {
          heading: '5. Third-Party Sharing',
          content: `We do not sell, trade, or rent your personal information to third parties. We may share information with:

• Service providers who assist in our operations
• Legal authorities when required by law
• With your explicit consent for specific purposes`
        },
        {
          heading: '6. Cookies and Tracking',
          content: `Our website may use cookies to enhance your user experience. Cookies are small files stored on your device that help us remember your preferences. You can control cookie settings through your browser.`
        },
        {
          heading: '7. Children\'s Privacy',
          content: `Our website is not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13 without parental consent. If we become aware of such collection, we will take steps to delete the information promptly.`
        },
        {
          heading: '8. Your Rights',
          content: `You have the right to:

• Access your personal information
• Correct inaccurate information
• Request deletion of your information
• Opt-out of marketing communications
• Withdraw consent for data processing

To exercise these rights, please contact us using the information provided below.`
        },
        {
          heading: '9. Retention of Information',
          content: `We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy or as required by law. Once the purpose is fulfilled, we securely delete or anonymize your information.`
        },
        {
          heading: '10. Links to Other Websites',
          content: `Our website may contain links to other websites. We are not responsible for the privacy practices of third-party websites. We encourage you to review their privacy policies before providing any personal information.`
        },
        {
          heading: '11. Changes to This Privacy Policy',
          content: `We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the updated policy on our website and updating the "Last Updated" date. Your continued use of the website constitutes your acceptance of the updated policy.`
        },
        {
          heading: '12. Contact Us',
          content: `If you have questions about this Privacy Policy or our privacy practices, please contact us:

Email: ${schoolDetails.contact.email}
Phone: ${schoolDetails.contact.phone}
Address: ${schoolDetails.address.street}, ${schoolDetails.address.city}, ${schoolDetails.address.state} ${schoolDetails.address.pincode}`
        }
      ]
    },
    hi: {
      title: 'गोपनीयता नीति',
      lastUpdated: 'अंतिम अपडेट: जनवरी 2026',
      sections: [
        {
          heading: '1. परिचय',
          content: `${schoolDetails.name} में, हम आपकी गोपनीयता की रक्षा करने और हमारी वेबसाइट पर एक सकारात्मक अनुभव सुनिश्चित करने के लिए प्रतिबद्ध हैं। यह गोपनीयता नीति बताती है कि जब आप हमारी वेबसाइट पर जाते हैं और हमारे साथ इंटरैक्ट करते हैं तो हम आपकी जानकारी कैसे एकत्र, उपयोग और सुरक्षित रखते हैं।`
        },
        {
          heading: '2. हम कौन सी जानकारी एकत्र करते हैं',
          content: `हम विभिन्न तरीकों से आपके बारे में जानकारी एकत्र कर सकते हैं। साइट पर हम जो जानकारी एकत्र कर सकते हैं उसमें शामिल हैं:

• व्यक्तिगत डेटा: नाम, ईमेल पता, फोन नंबर, पोस्टल पता, जन्म तिथि
• डिवाइस जानकारी: आईपी पता, ब्राउज़र प्रकार, ऑपरेटिंग सिस्टम
• उपयोग जानकारी: देखे गए पृष्ठ, पृष्ठों पर बिताया गया समय, क्लिक की गई लिंकें
• प्रवेश जानकारी: शैक्षणिक पृष्ठभूमि, माता-पिता/अभिभावक विवरण, स्वास्थ्य जानकारी`
        },
        {
          heading: '3. हम आपकी जानकारी का उपयोग कैसे करते हैं',
          content: `हम निम्नलिखित तरीकों से एकत्र की गई जानकारी का उपयोग करते हैं:

• प्रवेश आवेदन को संसाधित करने और छात्र रिकॉर्ड बनाए रखने के लिए
• स्कूल गतिविधियों के बारे में माता-पिता/अभिभावकों से संवाद करने के लिए
• हमारी वेबसाइट और सेवाओं में सुधार करने के लिए
• प्रचारात्मक ईमेल और अपडेट भेजने के लिए (आपकी सहमति के साथ)
• कानूनी दायित्वों का पालन करने के लिए
• धोखाधड़ी से बचाने और सुरक्षा सुनिश्चित करने के लिए`
        },
        {
          heading: '4. डेटा सुरक्षा',
          content: `हम आपकी व्यक्तिगत जानकारी को अनुपयोगी पहुंच, परिवर्तन, प्रकटीकरण या विनाश से बचाने के लिए उचित तकनीकी और संगठनात्मक उपाय लागू करते हैं। हमारी वेबसाइट संवेदनशील जानकारी को ट्रांसमिशन के दौरान सुरक्षित रखने के लिए एसएसएल एन्क्रिप्शन का उपयोग करती है।`
        },
        {
          heading: '5. तीसरे पक्ष के साथ साझाकरण',
          content: `हम आपकी व्यक्तिगत जानकारी को तीसरे पक्ष को बेचते, व्यापार करते या किराए पर नहीं देते। हम निम्नलिखित के साथ जानकारी साझा कर सकते हैं:

• सेवा प्रदाता जो हमारे संचालन में सहायता करते हैं
• कानूनी प्राधिकारी जब कानून द्वारा आवश्यक हो
• विशिष्ट उद्देश्यों के लिए आपकी स्पष्ट सहमति के साथ`
        },
        {
          heading: '6. कुकीज़ और ट्रैकिंग',
          content: `हमारी वेबसाइट आपके उपयोगकर्ता अनुभव को बढ़ाने के लिए कुकीज़ का उपयोग कर सकती है। कुकीज़ छोटी फाइलें हैं जो आपके डिवाइस पर संग्रहीत होती हैं और हमें आपकी प्राथमिकताओं को याद रखने में मदद करती हैं। आप अपने ब्राउज़र के माध्यम से कुकी सेटिंग्स को नियंत्रित कर सकते हैं।`
        },
        {
          heading: '7. बच्चों की गोपनीयता',
          content: `हमारी वेबसाइट 13 साल से कम उम्र के बच्चों को लक्ष्य नहीं करती है। हम जानबूझकर 13 साल से कम उम्र के बच्चों से माता-पिता की सहमति के बिना व्यक्तिगत जानकारी एकत्र नहीं करते। यदि हमें ऐसी एकत्रित जानकारी का पता चलता है, तो हम तुरंत इसे हटाने के लिए कदम उठाएंगे।`
        },
        {
          heading: '8. आपके अधिकार',
          content: `आपको निम्नलिखित का अधिकार है:

• आपकी व्यक्तिगत जानकारी तक पहुंचना
• गलत जानकारी को सही करना
• आपकी जानकारी को हटाने का अनुरोध करना
• विपणन संचार से बाहर निकलना
• डेटा प्रसंस्करण के लिए सहमति वापस लेना

इन अधिकारों का प्रयोग करने के लिए, कृपया नीचे दी गई जानकारी का उपयोग करके हमसे संपर्क करें।`
        },
        {
          heading: '9. जानकारी को बनाए रखना',
          content: `हम आपकी व्यक्तिगत जानकारी को इस नीति में उल्लिखित उद्देश्यों को पूरा करने के लिए या कानून द्वारा आवश्यक के रूप में रखते हैं। एक बार उद्देश्य पूरा हो जाने के बाद, हम सुरक्षित रूप से आपकी जानकारी को हटाते या गुमनाम करते हैं।`
        },
        {
          heading: '10. अन्य वेबसाइटों के लिंक',
          content: `हमारी वेबसाइट में अन्य वेबसाइटों के लिंक हो सकते हैं। हम तीसरे पक्ष की वेबसाइटों की गोपनीयता प्रथाओं के लिए जिम्मेदार नहीं हैं। हम आपको व्यक्तिगत जानकारी प्रदान करने से पहले उनकी गोपनीयता नीतियों की समीक्षा करने के लिए प्रोत्साहित करते हैं।`
        },
        {
          heading: '11. इस गोपनीयता नीति में परिवर्तन',
          content: `हम समय-समय पर इस गोपनीयता नीति को अपडेट कर सकते हैं। हम महत्वपूर्ण परिवर्तनों के बारे में आपको अपडेट की गई नीति को हमारी वेबसाइट पर पोस्ट करके और "अंतिम अपडेट" तारीख को अपडेट करके सूचित करेंगे। वेबसाइट का आपका निरंतर उपयोग अपडेट की गई नीति को स्वीकार करना है।`
        },
        {
          heading: '12. हमसे संपर्क करें',
          content: `यदि आपके पास इस गोपनीयता नीति या हमारी गोपनीयता प्रथाओं के बारे में प्रश्न हैं, तो कृपया हमसे संपर्क करें:

ईमेल: ${schoolDetails.contact.email}
फोन: ${schoolDetails.contact.phone}
पता: ${schoolDetails.address.street}, ${schoolDetails.address.city}, ${schoolDetails.address.state} ${schoolDetails.address.pincode}`
        }
      ]
    }
  };

  const currentContent = content[language];

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>{currentContent.title}</h1>
        <p>{currentContent.lastUpdated}</p>
        <button className={styles.languageToggle} onClick={toggleLanguage}>
          {language === 'en' ? 'हिंदी' : 'English'}
        </button>
      </motion.div>

      <motion.div
        className={styles.content}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {currentContent.sections.map((section, index) => (
          <motion.section
            key={index}
            className={styles.section}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2>{section.heading}</h2>
            <p>{section.content}</p>
          </motion.section>
        ))}
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;
