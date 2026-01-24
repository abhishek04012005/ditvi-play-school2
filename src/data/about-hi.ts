import CreativeLearingIcon from '@mui/icons-material/EmojiObjects';
import SafeEnvironmentIcon from '@mui/icons-material/Favorite';
import ExpertTeacherIcon from '@mui/icons-material/School';
import FunActivitiesIcon from '@mui/icons-material/Celebration';
import FounderImage from '../../public/assets/about/director.jpg'
import { AboutFeature, FounderMessage } from '@/types/about-types';
import schoolDetailsHi from '@/json/schooldetails-hi';

export const aboutFeaturesHi: AboutFeature[] = [
  {
    icon: CreativeLearingIcon,
    title: "रचनात्मक सीखना",
    description: "हम हाथों से काम करने वाली गतिविधियों के माध्यम से रचनात्मकता और कल्पना को प्रोत्साहित करते हैं जो अन्वेषण और आत्म-अभिव्यक्ति को प्रोत्साहित करते हैं।"
  },
  {
    icon: SafeEnvironmentIcon,
    title: "सुरक्षित वातावरण",
    description: "एक सुरक्षित, पोषणकारी स्थान जहां प्रत्येक बच्चा मूल्यवान, सम्मानित महसूस करता है और अपनी गति से अभिव्यक्ति और सीखने के लिए स्वतंत्र है।"
  },
  {
    icon: ExpertTeacherIcon,
    title: "विशेषज्ञ शिक्षक",
    description: "हमारी अनुभवी शिक्षकों की समर्पित टीम बाल विकास में प्रशिक्षित है और प्रत्येक बच्चे को व्यक्तिगत ध्यान प्रदान करने के लिए प्रतिबद्ध है।"
  },
  {
    icon: FunActivitiesIcon,
    title: "मजेदार गतिविधियां",
    description: "खेल के माध्यम से सीखना हमारा मूल दर्शन है। हम ऐसी आकर्षक गतिविधियों को डिजाइन करते हैं जो शिक्षा को प्रत्येक बच्चे के लिए आनंददायक और स्मरणीय बनाती हैं।"
  }
];

export const founderMessageHi: FounderMessage = {
  name: schoolDetailsHi.director.name,
  position: schoolDetailsHi.director.designation,
  message: `एक शिक्षक के रूप में 15 साल के अनुभव के साथ, मैंने ${schoolDetailsHi.name} की स्थापना की थी ताकि एक ऐसी जगह बनाई जा सके जहां बच्चे सीख सकें, बढ़ सकें और आगे बढ़ सकें। हमारा दृष्टिकोण आधुनिक शिक्षा पद्धतियों को पारंपरिक मूल्यों के साथ जोड़ता है, यह सुनिश्चित करते हुए कि प्रत्येक बच्चे को भविष्य की सफलता के लिए आवश्यक आधार प्राप्त होता है।`,
  image: FounderImage
};
