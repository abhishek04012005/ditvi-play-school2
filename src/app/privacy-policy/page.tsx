'use client';

import { useState } from 'react';
import styles from './privacy-policy.module.css';

export default function PrivacyPolicy() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  const content = {
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last Updated: January 2026',
      intro: 'At Ditvi Play School, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.',
      sections: [
        {
          heading: '1. Information We Collect',
          content: `We may collect information about you in a variety of ways. The information we may collect on the Site includes:

• Personal Data: Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as age, gender, hometown, and similar information, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site.

• Financial and Billing Information: Financial information, such as credit card numbers and bank account information, that we may collect when you purchase, order, return, exchange, or request information about our services from the Site.

• Data From Social Networks: User information from social networks, including your name, your social network username, location, gender, birth date, email address, profile picture, and public data for contacts, if you connect your account to such social networks.

• Mobile Device Data: Device information, such as your mobile device ID, model, and manufacturer, and information about the location of your device, if you access the Site from a mobile device.

• Log Data: Information about your computer or mobile device and internet connection, including the IP address, browser type and version, operating system and version, and your activities on the Site.`,
        },
        {
          heading: '2. Use of Your Information',
          content: `Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:

• Create and manage your account
• Email you regarding your account or order
• Fulfill and send out your purchases, orders, or other requests
• Generate a personal profile about you so that future visits to the Site will be personalized as possible
• Increase the efficiency and operation of the Site
• Monitor and analyze usage and trends to improve your experience with the Site
• Notify you of updates to the Site
• Offer new products, services, and/or recommendations to you`,
        },
        {
          heading: '3. Disclosure of Your Information',
          content: `We may share information we have collected about you in certain circumstances:

• By Law or to Protect Rights: If we believe the release of information about you is necessary to comply with the law, enforce our Site policies, or protect ours or others' rights, property, and safety.

• Third-Party Service Providers: We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.

• Business Transfers: If we are involved in a merger, acquisition, or asset sale, your information may be transferred as part of that transaction.

• Consent: We may disclose your information with your consent for any other purpose.`,
        },
        {
          heading: '4. Security of Your Information',
          content: `We use administrative, technical, and physical security measures to protect your personal information. However, no method of transmission over the Internet or method of electronic storage is 100% secure. We cannot guarantee its absolute security.

We use SSL encryption to protect sensitive information online. We also protect your personal information offline. Only employees who need the information to perform a specific job are granted access to personally identifiable information. The computers/servers in which we store personally identifiable information are kept in a secure environment.`,
        },
        {
          heading: '5. Contact Us Regarding Privacy',
          content: `If you have questions or comments about this Privacy Policy, please contact us at:

Ditvi Play School
Email: privacy@ditvi.school
Phone: +91 (555) 123-4567
Address: 123 Main Street, Your City, State, Pincode

We will respond to your inquiry within 7 business days.`,
        },
        {
          heading: '6. Changes to This Privacy Policy',
          content: `We may update this Privacy Policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons. We will notify you by updating the "Last Updated" date of this Privacy Policy, and your continued use of the Site following the posting of revised Privacy Policy means that you accept and agree to the changes.`,
        },
        {
          heading: '7. Your Rights',
          content: `Depending on your location, you may have the following rights:

• Right to Access: You have the right to access your personal information
• Right to Correction: You have the right to correct inaccurate information
• Right to Deletion: You have the right to request deletion of your information
• Right to Opt-Out: You have the right to opt-out of marketing communications
• Right to Data Portability: You have the right to receive your data in a portable format`,
        },
      ],
    },
    hi: {
      title: 'गोपनीयता नीति',
      lastUpdated: 'अंतिम अपडेट: जनवरी 2026',
      intro: 'दिव्या प्ले स्कूल में, हम आपकी गोपनीयता की सुरक्षा के लिए प्रतिबद्ध हैं। यह गोपनीयता नीति बताती है कि जब आप हमारी वेबसाइट पर जाते हैं और हमारी सेवाओं का उपयोग करते हैं तो हम आपकी जानकारी को कैसे एकत्र, उपयोग, प्रकट और सुरक्षित रखते हैं।',
      sections: [
        {
          heading: '1. हम कौन सी जानकारी एकत्र करते हैं',
          content: `हम विभिन्न तरीकों से आपके बारे में जानकारी एकत्र कर सकते हैं। साइट पर जो जानकारी हम एकत्र कर सकते हैं वह शामिल है:

• व्यक्तिगत डेटा: व्यक्तिगत रूप से पहचाने जाने योग्य जानकारी, जैसे आपका नाम, शिपिंग पता, ईमेल पता और फोन नंबर, और जनसांख्यिकीय जानकारी, जैसे उम्र, लिंग, गृहनगर, और इसी तरह की जानकारी जो आप स्वेच्छा से साइट पर नामांकन करते समय या जब आप साइट से संबंधित विभिन्न गतिविधियों में भाग लेने का चुनाव करते हैं तो हमें देते हैं।

• वित्तीय और बिलिंग जानकारी: वित्तीय जानकारी, जैसे क्रेडिट कार्ड नंबर और बैंक खाता जानकारी, जो हम एकत्र कर सकते हैं जब आप साइट से खरीद, ऑर्डर, रिटर्न, एक्सचेंज, या सेवाओं के बारे में जानकारी का अनुरोध करते हैं।

• सोशल नेटवर्क से डेटा: सोशल नेटवर्क से उपयोगकर्ता जानकारी, जिसमें आपका नाम, आपकी सोशल नेटवर्क उपयोगकर्ता नाम, स्थान, लिंग, जन्मतिथि, ईमेल पता, प्रोफ़ाइल चित्र, और संपर्कों के लिए सार्वजनिक डेटा शामिल है, यदि आप अपने खाते को ऐसे सोशल नेटवर्क से जोड़ते हैं।

• मोबाइल डिवाइस डेटा: डिवाइस जानकारी, जैसे आपका मोबाइल डिवाइस आईडी, मॉडल और निर्माता, और आपके डिवाइस के स्थान की जानकारी, यदि आप मोबाइल डिवाइस से साइट तक पहुंचते हैं।

• लॉग डेटा: आपके कंप्यूटर या मोबाइल डिवाइस और इंटरनेट कनेक्शन के बारे में जानकारी, जिसमें आईपी पता, ब्राउज़र प्रकार और संस्करण, ऑपरेटिंग सिस्टम और संस्करण, और साइट पर आपकी गतिविधियां शामिल हैं।`,
        },
        {
          heading: '2. आपकी जानकारी का उपयोग',
          content: `आपके बारे में सटीक जानकारी होना हमें आपको एक सहज, कुशल और अनुकूलित अनुभव प्रदान करने की अनुमति देता है। विशेष रूप से, हम साइट के बारे में एकत्र की गई जानकारी का उपयोग निम्न के लिए कर सकते हैं:

• आपका खाता बनाएं और प्रबंधित करें
• आपके खाते या ऑर्डर के संबंध में आपको ईमेल करें
• आपकी खरीदारी, ऑर्डर, या अन्य अनुरोधों को पूरा करें और भेजें
• आपके बारे में एक व्यक्तिगत प्रोफ़ाइल बनाएं ताकि साइट पर भविष्य के दौरे यथासंभव व्यक्तिगत हों
• साइट की दक्षता और संचालन में वृद्धि करें
• उपयोग और रुझानों की निगरानी और विश्लेषण करें आपके अनुभव में सुधार के लिए
• साइट में अपडेट के बारे में आपको सूचित करें
• आपको नई उत्पाद, सेवाओं और/या अनुशंसाएं प्रदान करें`,
        },
        {
          heading: '3. आपकी जानकारी का प्रकटीकरण',
          content: `हम कुछ परिस्थितियों में आपके बारे में एकत्र की गई जानकारी साझा कर सकते हैं:

• कानून द्वारा या अधिकारों की सुरक्षा के लिए: यदि हमें लगता है कि आपके बारे में जानकारी जारी करना कानून का पालन करने, हमारी साइट नीतियों को लागू करने, या हमारे या अन्य लोगों के अधिकारों, संपत्ति और सुरक्षा की रक्षा करने के लिए आवश्यक है।

• तृतीय-पक्ष सेवा प्रदाता: हम तृतीय पक्षों के साथ आपकी जानकारी साझा कर सकते हैं जो हमारे लिए या हमारी ओर से सेवाएं प्रदान करते हैं, जिसमें भुगतान प्रसंस्करण, डेटा विश्लेषण, ईमेल वितरण, होस्टिंग सेवाएं, ग्राहक सेवा और मार्केटिंग सहायता शामिल है।

• व्यावसायिक स्थानान्तरण: यदि हम एक विलय, अधिग्रहण, या संपत्ति बिक्री में शामिल हैं, तो आपकी जानकारी उस लेनदेन के हिस्से के रूप में स्थानांतरित की जा सकती है।

• सहमति: हम किसी भी अन्य उद्देश्य के लिए आपकी सहमति के साथ आपकी जानकारी का प्रकटीकरण कर सकते हैं।`,
        },
        {
          heading: '4. आपकी जानकारी की सुरक्षा',
          content: `हम आपकी व्यक्तिगत जानकारी की सुरक्षा के लिए प्रशासनिक, तकनीकी और भौतिक सुरक्षा उपायों का उपयोग करते हैं। हालांकि, इंटरनेट पर संचरण की कोई विधि या इलेक्ट्रॉनिक भंडारण की विधि 100% सुरक्षित नहीं है। हम इसकी पूर्ण सुरक्षा की गारंटी नहीं दे सकते।

हम ऑनलाइन संवेदनशील जानकारी की सुरक्षा के लिए SSL एन्क्रिप्शन का उपयोग करते हैं। हम ऑफलाइन आपकी व्यक्तिगत जानकारी की भी सुरक्षा करते हैं। केवल कर्मचारी जिन्हें जानकारी की आवश्यकता है एक विशिष्ट काम को पूरा करने के लिए व्यक्तिगत रूप से पहचाने जाने योग्य जानकारी तक पहुंचने का अनुदान प्राप्त है। जिन कंप्यूटर/सर्वर में हम व्यक्तिगत रूप से पहचाने जाने योग्य जानकारी संग्रहीत करते हैं वे एक सुरक्षित वातावरण में रखे जाते हैं।`,
        },
        {
          heading: '5. गोपनीयता के संबंध में हमसे संपर्क करें',
          content: `यदि आपके पास इस गोपनीयता नीति के बारे में कोई प्रश्न या टिप्पणी है, तो कृपया हमसे संपर्क करें:

दिव्या प्ले स्कूल
ईमेल: privacy@ditvi.school
फोन: +91 (555) 123-4567
पता: 123 मुख्य स्ट्रीट, आपका शहर, राज्य, पिनकोड

हम 7 व्यावसायिक दिनों के भीतर आपकी पूछताछ का जवाब देंगे।`,
        },
        {
          heading: '6. इस गोपनीयता नीति में परिवर्तन',
          content: `हम समय-समय पर इस गोपनीयता नीति को अपडेट कर सकते हैं ताकि, उदाहरण के लिए, हमारी प्रथाओं में परिवर्तन या अन्य परिचालन, कानूनी या नियामक कारणों को प्रतिबिंबित किया जा सके। हम इस गोपनीयता नीति की "अंतिम अपडेट" तारीख को अपडेट करके आपको सूचित करेंगे, और संशोधित गोपनीयता नीति को पोस्ट करने के बाद साइट का आपका निरंतर उपयोग का अर्थ है कि आप परिवर्तनों को स्वीकार और सहमत हैं।`,
        },
        {
          heading: '7. आपके अधिकार',
          content: `आपके स्थान के आधार पर, आपके पास निम्नलिखित अधिकार हो सकते हैं:

• अभिगम का अधिकार: आपको अपनी व्यक्तिगत जानकारी तक पहुंचने का अधिकार है
• सुधार का अधिकार: आपको गलत जानकारी को सही करने का अधिकार है
• विलोपन का अधिकार: आपको अपनी जानकारी को हटाने का अनुरोध करने का अधिकार है
• ऑप्ट-आउट का अधिकार: आपको विपणन संचार से ऑप्ट-आउट करने का अधिकार है
• डेटा पोर्टेबिलिटी का अधिकार: आपको एक पोर्टेबल प्रारूप में अपना डेटा प्राप्त करने का अधिकार है`,
        },
      ],
    },
  };

  const currentContent = content[language];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{currentContent.title}</h1>
        <div className={styles.languageToggle}>
          <button
            className={`${styles.langBtn} ${language === 'en' ? styles.active : ''}`}
            onClick={() => setLanguage('en')}
          >
            English
          </button>
          <button
            className={`${styles.langBtn} ${language === 'hi' ? styles.active : ''}`}
            onClick={() => setLanguage('hi')}
          >
            हिन्दी
          </button>
        </div>
        <p className={styles.lastUpdated}>{currentContent.lastUpdated}</p>
      </div>

      <div className={styles.content}>
        <p className={styles.intro}>{currentContent.intro}</p>

        {currentContent.sections.map((section, index) => (
          <div key={index} className={styles.section}>
            <h2>{section.heading}</h2>
            <p>{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
