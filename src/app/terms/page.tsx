'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './terms.module.css';
import schoolDetails from '@/json/schooldetails';

const TermsOfService = () => {
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
      title: 'Terms of Service',
      lastUpdated: 'Last Updated: January 2026',
      sections: [
        {
          heading: '1. Acceptance of Terms',
          content: `By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`
        },
        {
          heading: '2. Use License',
          content: `Permission is granted to temporarily download one copy of the materials (information or software) on ${schoolDetails.name}'s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:

• Modify or copy the materials
• Use the materials for any commercial purpose or for any public display
• Attempt to decompile or reverse engineer any software contained on the website
• Remove any copyright or other proprietary notations from the materials
• Transfer the materials to another person or "mirror" the materials on any other server
• Violate any applicable laws or regulations`
        },
        {
          heading: '3. Disclaimer',
          content: `The materials on ${schoolDetails.name}'s website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.`
        },
        {
          heading: '4. Limitations',
          content: `In no event shall ${schoolDetails.name} or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the website, even if we or an authorized representative has been notified orally or in writing of the possibility of such damage.`
        },
        {
          heading: '5. Accuracy of Materials',
          content: `The materials appearing on our website could include technical, typographical, or photographic errors. We do not warrant that any of the materials on our website are accurate, complete, or current. We may make changes to the materials contained on our website at any time without notice.`
        },
        {
          heading: '6. Links',
          content: `We have not reviewed all of the sites linked to our website and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site. Use of any such linked website is at the user's own risk.`
        },
        {
          heading: '7. Modifications',
          content: `We may revise these terms of service for our website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.`
        },
        {
          heading: '8. Governing Law',
          content: `These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.`
        },
        {
          heading: '9. User Conduct',
          content: `You agree not to:

• Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the website
• Post or upload any content that is unlawful, threatening, abusive, defamatory, obscene, or otherwise objectionable
• Transmit any viruses or malicious code
• Interfere with the normal operation of the website
• Harass or cause distress or inconvenience to any person
• Collect or track personal information of others
• Spam or send unsolicited messages`
        },
        {
          heading: '10. Admission and Enrollment',
          content: `For admission to ${schoolDetails.name}:

• All submitted information must be accurate and complete
• Parents/guardians must provide accurate contact information
• Medical records and health information must be truthful
• Parents/guardians agree to comply with school policies and procedures
• School reserves the right to withdraw admission if any information is found to be false or misleading`
        },
        {
          heading: '11. Student Conduct',
          content: `Students are expected to:

• Maintain a safe and respectful environment
• Follow school rules and regulations
• Respect the rights and property of others
• Participate in school activities
• Comply with dress code and behavior policies

The school reserves the right to take disciplinary action for violations.`
        },
        {
          heading: '12. Fees and Payments',
          content: `• All fees must be paid as per the school fee structure
• Payment terms and methods are as specified by the school
• Late payment may result in additional charges
• Non-payment may result in suspension of student services
• Fees are non-refundable except as per school refund policy`
        },
        {
          heading: '13. Intellectual Property Rights',
          content: `All materials on this website, including text, graphics, logos, images, and software, are the property of ${schoolDetails.name} or its content suppliers and are protected by international copyright laws.`
        },
        {
          heading: '14. Contact for Questions',
          content: `If you have any questions about these Terms of Service, please contact us:

Email: ${schoolDetails.contact.email}
Phone: ${schoolDetails.contact.phone}
Address: ${schoolDetails.address.street}, ${schoolDetails.address.city}, ${schoolDetails.address.state} ${schoolDetails.address.pincode}`
        }
      ]
    },
    hi: {
      title: 'सेवा की शर्तें',
      lastUpdated: 'अंतिम अपडेट: जनवरी 2026',
      sections: [
        {
          heading: '1. शर्तों की स्वीकृति',
          content: `इस वेबसाइट तक पहुंचने और उपयोग करके, आप इस समझौते की शर्तों और प्रावधानों द्वारा बाध्य होने के लिए सहमत हैं। यदि आप उपरोक्त का पालन नहीं करने के लिए सहमत नहीं हैं, तो कृपया इस सेवा का उपयोग न करें।`
        },
        {
          heading: '2. उपयोग लाइसेंस',
          content: `${schoolDetails.name} की वेबसाइट पर सामग्री (जानकारी या सॉफ्टवेयर) की एक प्रति को अस्थायी रूप से केवल व्यक्तिगत, गैर-वाणिज्यिक क्षणिक दृश्य के लिए डाउनलोड करने की अनुमति दी जाती है। यह एक लाइसेंस का अनुदान है, शीर्षक का हस्तांतरण नहीं है, और इस लाइसेंस के तहत आप नहीं कर सकते:

• सामग्री को संशोधित या कॉपी करना
• किसी वाणिज्यिक उद्देश्य के लिए या किसी सार्वजनिक प्रदर्शन के लिए सामग्री का उपयोग करना
• वेबसाइट पर कोई भी सॉफ्टवेयर को डीकंपाइल या रिवर्स इंजीनियर करने का प्रयास करना
• सामग्री से कॉपीराइट या अन्य मालिकाना नोटिस हटाना
• सामग्री को किसी अन्य व्यक्ति को स्थानांतरित करना या किसी अन्य सर्वर पर सामग्री को "मिरर" करना
• किसी भी लागू कानून या नियमों का उल्लंघन करना`
        },
        {
          heading: '3. अस्वीकरण',
          content: `${schoolDetails.name} की वेबसाइट पर सामग्री 'जैसा है' आधार पर प्रदान की जाती है। हम कोई वारंटी नहीं देते, चाहे व्यक्त हो या निहित, और यहां सभी अन्य वारंटियों से इनकार और नकार देते हैं, जिसमें सीमा के बिना, किसी विशेष उद्देश्य के लिए व्यापारिकता, फिटनेस, या बौद्धिक संपत्ति के गैर-उल्लंघन की निहित वारंटियां या शर्तें शामिल हैं।`
        },
        {
          heading: '4. सीमाएं',
          content: `किसी भी स्थिति में ${schoolDetails.name} या इसके आपूर्तिकर्ता किसी भी नुकसान के लिए जिम्मेदार नहीं होंगे (जिसमें बिना सीमा के, डेटा या लाभ के नुकसान के लिए नुकसान, या व्यावसायिक व्यवधान के कारण) वेबसाइट पर सामग्री के उपयोग या उपयोग करने में असमर्थता से उत्पन्न होते हैं, भले ही हम या एक अधिकृत प्रतिनिधि को इस तरह के नुकसान की संभावना के बारे में मौखिक या लिखित रूप से अधिसूचित किया गया हो।`
        },
        {
          heading: '5. सामग्री की सटीकता',
          content: `हमारी वेबसाइट पर दिखाई देने वाली सामग्री में तकनीकी, टाइपोग्राफिक या फोटोग्राफिक त्रुटियां हो सकती हैं। हम यह वारंटी नहीं देते कि हमारी वेबसाइट पर कोई भी सामग्री सटीक, पूर्ण या वर्तमान है। हम बिना किसी सूचना के किसी भी समय हमारी वेबसाइट पर निहित सामग्री में परिवर्तन कर सकते हैं।`
        },
        {
          heading: '6. लिंक',
          content: `हमने अपनी वेबसाइट से जुड़ी सभी साइटों की समीक्षा नहीं की है और किसी भी ऐसी जुड़ी साइट की सामग्री के लिए जिम्मेदार नहीं हैं। किसी भी लिंक का समावेश हमारे द्वारा साइट के समर्थन को इंगित नहीं करता है। किसी भी ऐसी जुड़ी वेबसाइट का उपयोग उपयोगकर्ता के अपने जोखिम पर है।`
        },
        {
          heading: '7. संशोधन',
          content: `हम अपनी वेबसाइट के लिए सेवा की इन शर्तों को बिना किसी सूचना के किसी भी समय संशोधित कर सकते हैं। इस वेबसाइट का उपयोग करके, आप सेवा की इन शर्तों के तत्कालीन वर्तमान संस्करण द्वारा बाध्य होने के लिए सहमत हैं।`
        },
        {
          heading: '8. शासन कानून',
          content: `ये शर्तें भारत के कानूनों द्वारा संचालित और निर्मित हैं, और आप उस स्थान की अदालतों के एक्सक्लूसिव अधिकार के लिए अपरिवर्तनीय रूप से सहमत हैं।`
        },
        {
          heading: '9. उपयोगकर्ता आचरण',
          content: `आप निम्नलिखित से सहमत हैं:

• किसी भी व्यवहार में शामिल न हों जो किसी के उपयोग या वेबसाइट के आनंद को प्रतिबंधित या बाधित करता है
• कोई भी सामग्री पोस्ट या अपलोड न करें जो अवैध, धमकी देने वाली, अपमानजनक, मानहानि, अस्पष्ट हो
• किसी भी वायरस या दुर्भावनापूर्ण कोड को ट्रांसमिट न करें
• वेबसाइट के सामान्य संचालन में हस्तक्षेप न करें
• किसी भी व्यक्ति को परेशान या तकलीफ देने वाली कार्रवाई न करें
• दूसरों की व्यक्तिगत जानकारी एकत्र या ट्रैक न करें
• स्पैम न करें या अनचाहे संदेश न भेजें`
        },
        {
          heading: '10. प्रवेश और नामांकन',
          content: `${schoolDetails.name} में प्रवेश के लिए:

• सभी प्रस्तुत की गई जानकारी सटीक और पूर्ण होनी चाहिए
• माता-पिता/अभिभावकों को सटीक संपर्क जानकारी प्रदान करनी चाहिए
• चिकित्सा रिकॉर्ड और स्वास्थ्य जानकारी सत्यापन होनी चाहिए
• माता-पिता/अभिभावक स्कूल नीतियों और प्रक्रियाओं का पालन करने के लिए सहमत हैं
• स्कूल को यदि कोई जानकारी गलत या भ्रामक पाई जाती है तो प्रवेश को वापस लेने का अधिकार है`
        },
        {
          heading: '11. छात्र आचरण',
          content: `छात्रों से निम्नलिखित की अपेक्षा की जाती है:

• एक सुरक्षित और सम्मानपूर्ण वातावरण बनाए रखना
• स्कूल के नियमों और विनियमों का पालन करना
• दूसरों के अधिकारों और संपत्ति का सम्मान करना
• स्कूल गतिविधियों में भाग लेना
• ड्रेस कोड और व्यवहार नीतियों का पालन करना

स्कूल को उल्लंघनों के लिए अनुशासनात्मक कार्रवाई करने का अधिकार है।`
        },
        {
          heading: '12. फीस और भुगतान',
          content: `• स्कूल शुल्क संरचना के अनुसार सभी फीस का भुगतान करना होगा
• भुगतान की शर्तें और तरीके स्कूल द्वारा निर्दिष्ट हैं
• देर से भुगतान से अतिरिक्त शुल्क हो सकता है
• गैर-भुगतान से छात्र सेवाओं में निलंबन हो सकता है
• फीस गैर-वापसी योग्य है सिवाय स्कूल की वापसी नीति के अनुसार`
        },
        {
          heading: '13. बौद्धिक संपत्ति अधिकार',
          content: `इस वेबसाइट पर सभी सामग्री, जिसमें पाठ, ग्राफिक्स, लोगो, चित्र और सॉफ्टवेयर शामिल हैं, ${schoolDetails.name} या इसके सामग्री आपूर्तिकर्ताओं की संपत्ति हैं और अंतर्राष्ट्रीय कॉपीराइट कानूनों द्वारा संरक्षित हैं।`
        },
        {
          heading: '14. प्रश्नों के लिए संपर्क',
          content: `यदि आपके पास सेवा की इन शर्तों के बारे में कोई प्रश्न है, तो कृपया हमसे संपर्क करें:

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

export default TermsOfService;
