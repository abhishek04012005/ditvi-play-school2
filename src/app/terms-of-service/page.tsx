'use client';

import { useState } from 'react';
import styles from './terms-of-service.module.css';

export default function TermsOfService() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  const content = {
    en: {
      title: 'Terms of Service',
      lastUpdated: 'Last Updated: January 2026',
      intro: 'These Terms of Service constitute a legally binding agreement made between you and Ditvi Play School regarding your use of our website and services. Please read these terms carefully before accessing or using our services.',
      sections: [
        {
          heading: '1. Agreement to Terms',
          content: `By accessing and using this website, you accept and agree to be bound by and comply with these Terms and Conditions and our Privacy Policy. If you do not agree to abide by the above, please do not use this service. We reserve the right, at our sole discretion, to change, modify or otherwise alter these Terms and Conditions at any time.`,
        },
        {
          heading: '2. User Responsibilities',
          content: `You are responsible for maintaining the confidentiality of your account information, including passwords. You agree to accept responsibility for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any breach of security.

You agree not to use the Site for any purpose that is unlawful or prohibited by these Terms and Conditions, or any other agreement to which you are subject. You may not transmit any content that is offensive, abusive, defamatory, obscene, or otherwise objectionable.`,
        },
        {
          heading: '3. Intellectual Property Rights',
          content: `Unless otherwise stated, Ditvi Play School owns the intellectual property rights for all material on this website. All intellectual property rights are reserved. You may access this for your personal use subject to restrictions set in these terms and conditions.

You must not reproduce, publish, transmit, or distribute any content without our prior written permission.`,
        },
        {
          heading: '4. Limitations of Liability',
          content: `In no event shall Ditvi Play School, nor any of its officers, directors, and employees be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract, tort or otherwise.

We shall not be held liable for any indirect, consequential, or special liability arising out of or in any way related to your use of this site.`,
        },
        {
          heading: '5. Indemnification',
          content: `Except where prohibited by law, by using this Website you indemnify and hold harmless Ditvi Play School and its officers, directors, employees, and agents from and against any and all claims, damages, liabilities, costs and expenses arising out of or connected with your use or misuse of this Website.`,
        },
        {
          heading: '6. Severability',
          content: `If any term, clause, or provision of these Terms and Conditions is held invalid or unenforceable, then that term, clause, or provision will be severable from these Terms and Conditions and will not affect the validity or enforceability of any remaining part of that term, clause or provision, or any other term, clause or provision of these Terms and Conditions.`,
        },
        {
          heading: '7. Termination',
          content: `We may terminate or suspend your account and right to use the website immediately, without prior notice or liability, for any reason whatsoever, including if you breach the Terms.

Upon termination of your access, your right to use the website will immediately cease.`,
        },
        {
          heading: '8. Governing Law',
          content: `These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.`,
        },
        {
          heading: '9. Contact Information',
          content: `If you have any questions about these Terms of Service, please contact us at:

Ditvi Play School
Email: support@ditvi.school
Phone: +91 (555) 123-4567
Address: 123 Main Street, Your City, State, Pincode`,
        },
      ],
    },
    hi: {
      title: 'सेवा की शर्तें',
      lastUpdated: 'अंतिम अपडेट: जनवरी 2026',
      intro: 'ये सेवा की शर्तें आप और दिव्या प्ले स्कूल के बीच हमारी वेबसाइट और सेवाओं के उपयोग के संबंध में कानूनी रूप से बाध्यकारी समझौते का गठन करती हैं। कृपया हमारी सेवाओं को एक्सेस करने या उपयोग करने से पहले इन शर्तों को ध्यान से पढ़ें।',
      sections: [
        {
          heading: '1. शर्तों के लिए सहमति',
          content: `इस वेबसाइट को एक्सेस करके और उपयोग करके, आप इन शर्तों और शर्तों और हमारी गोपनीयता नीति द्वारा बाध्य होने के लिए सहमत हैं और स्वीकार करते हैं। यदि आप उपरोक्त का पालन करने के लिए सहमत नहीं हैं, तो कृपया इस सेवा का उपयोग न करें। हम हमारे विवेक पर, किसी भी समय इन शर्तों और शर्तों को बदलने, संशोधित करने या अन्यथा बदलने का अधिकार सुरक्षित रखते हैं।`,
        },
        {
          heading: '2. उपयोगकर्ता की जिम्मेदारियां',
          content: `आप अपनी खाता जानकारी, पासवर्ड सहित, की गोपनीयता बनाए रखने के लिए जिम्मेदार हैं। आप अपने खाते के तहत होने वाली सभी गतिविधियों के लिए जिम्मेदारी स्वीकार करने के लिए सहमत हैं। आप अपने खाते के किसी भी अनधिकृत उपयोग या किसी भी सुरक्षा उल्लंघन की तुरंत सूचना देने के लिए सहमत हैं।

आप साइट का उपयोग किसी भी उद्देश्य के लिए नहीं करने के लिए सहमत हैं जो इन शर्तों और शर्तों द्वारा गैरकानूनी या निषिद्ध है, या किसी अन्य समझौते जिससे आप अधीन हैं। आप किसी भी सामग्री को प्रसारित नहीं कर सकते जो आपत्तिजनक, दुर्व्यवहारपूर्ण, मानहानिकारक, अश्लील, या अन्यथा आपत्तिजनक है।`,
        },
        {
          heading: '3. बौद्धिक संपत्ति अधिकार',
          content: `अन्यथा कहा जाने के बिना, दिव्या प्ले स्कूल इस वेबसाइट पर सभी सामग्री के लिए बौद्धिक संपत्ति अधिकार रखता है। सभी बौद्धिक संपत्ति अधिकार आरक्षित हैं। आप इन शर्तों और शर्तों में निर्धारित प्रतिबंधों के अधीन अपने व्यक्तिगत उपयोग के लिए इसे एक्सेस कर सकते हैं।

आप हमारी पूर्व लिखित अनुमति के बिना किसी भी सामग्री को पुनः प्रकाशित, प्रकाशित, प्रसारित, या वितरित नहीं कर सकते।`,
        },
        {
          heading: '4. दायित्व की सीमा',
          content: `किसी भी परिस्थिति में दिव्या प्ले स्कूल, न ही इसके किसी भी अधिकारी, निदेशक, और कर्मचारी इस वेबसाइट के आपके उपयोग से उत्पन्न किसी भी चीज़ के लिए जिम्मेदार नहीं हैं, चाहे वह दायित्व अनुबंध, अनुचित कार्य या अन्यथा हो।

हम इस साइट के आपके उपयोग से उत्पन्न किसी भी अप्रत्यक्ष, परिणामी, या विशेष दायित्व के लिए जिम्मेदार नहीं होंगे।`,
        },
        {
          heading: '5. क्षतिपूर्ति',
          content: `जहां कानून द्वारा निषिद्ध नहीं है, इस वेबसाइट का उपयोग करके आप दिव्या प्ले स्कूल और इसके अधिकारियों, निदेशकों, कर्मचारियों, और एजेंटों को इस वेबसाइट के आपके उपयोग या दुरुपयोग से उत्पन्न होने वाले किसी भी दावे, नुकसान, दायित्व, लागत और खर्चों से क्षतिपूर्ति देते हैं।`,
        },
        {
          heading: '6. विभाज्यता',
          content: `यदि इन शर्तों और शर्तों की कोई भी अवधि, खंड, या प्रावधान अमान्य या अप्रवर्तनीय है, तो वह अवधि, खंड, या प्रावधान इन शर्तों और शर्तों से अलग हो जाएगा और इन शर्तों और शर्तों के किसी भी शेष हिस्से की वैधता या प्रवर्तनीयता को प्रभावित नहीं करेगा।`,
        },
        {
          heading: '7. समाप्ति',
          content: `हम किसी भी कारण से, पूर्व सूचना या दायित्व के बिना तुरंत, आपके खाते को समाप्त या निलंबित कर सकते हैं और वेबसाइट का उपयोग करने का अधिकार दे सकते हैं, जिसमें यदि आप शर्तों का उल्लंघन करते हैं।

आपकी पहुंच की समाप्ति पर, वेबसाइट का उपयोग करने का आपका अधिकार तुरंत समाप्त हो जाएगा।`,
        },
        {
          heading: '8. शासी कानून',
          content: `ये शर्तें और शर्तें भारत के कानूनों द्वारा शासित होती हैं और उनके अनुसार व्याख्या की जाती हैं, और आप उस स्थान में अदालतों के एकच्छत्र अधिकार क्षेत्र को अपरिवर्तनीय रूप से स्वीकार करते हैं।`,
        },
        {
          heading: '9. संपर्क जानकारी',
          content: `यदि आपके पास इन सेवा की शर्तों के बारे में कोई प्रश्न है, तो कृपया हमसे संपर्क करें:

दिव्या प्ले स्कूल
ईमेल: support@ditvi.school
फोन: +91 (555) 123-4567
पता: 123 मुख्य स्ट्रीट, आपका शहर, राज्य, पिनकोड`,
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
